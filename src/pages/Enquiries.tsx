
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Lead } from "@/types/crm";
import { Search, Mail, ArrowRight, Flag, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LeadCreationForm } from "@/components/LeadCreationForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Define the GmailEmail type
interface GmailEmail {
  id: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  received_at: string;
  body: string;
  read: boolean;
  has_attachments: boolean;
  is_enquiry: boolean;
  associated_lead_id?: string;
}

export default function Enquiries() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const [matchingLeads, setMatchingLeads] = useState<Lead[]>([]);
  const [showLeadCreation, setShowLeadCreation] = useState(false);
  const [filter, setFilter] = useState<'all' | 'enquiries' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEmails();
    }
  }, [user]);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gmail_emails')
        .select('*')
        .order('received_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setEmails(data as GmailEmail[]);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Error",
        description: "Failed to load emails. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsEnquiry = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('gmail_emails')
        .update({ is_enquiry: true })
        .eq('id', emailId);
      
      if (error) throw error;
      
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId 
            ? { ...email, is_enquiry: true } 
            : email
        )
      );
      
      toast({
        title: "Marked as Enquiry",
        description: "The email has been marked as an enquiry."
      });

      const email = emails.find(e => e.id === emailId);
      if (email) {
        await findMatchingLeads(email);
      }
    } catch (error) {
      console.error("Error marking as enquiry:", error);
      toast({
        title: "Error",
        description: "Failed to mark email as enquiry. Please try again.",
      });
    }
  };

  const findMatchingLeads = async (email: GmailEmail) => {
    try {
      const domain = email.sender_email.split('@')[1];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .or(`email.ilike.%${domain}%,name.ilike.%${email.sender_name.split(' ')[0]}%`);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setMatchingLeads(data as Lead[]);
      } else {
        setMatchingLeads([]);
      }
    } catch (error) {
      console.error("Error finding matching leads:", error);
    }
  };

  const handleConvertToLead = async (email: GmailEmail) => {
    setSelectedEmail(email);
    await findMatchingLeads(email);
    
    if (matchingLeads.length === 0) {
      setShowLeadCreation(true);
    }
  };

  const handleConnectToExistingLead = async (leadId: string) => {
    if (!selectedEmail) return;
    
    try {
      const { error } = await supabase
        .from('gmail_emails')
        .update({ 
          associated_lead_id: leadId,
          is_enquiry: true 
        })
        .eq('id', selectedEmail.id);
      
      if (error) throw error;
      
      setEmails(prev => 
        prev.map(email => 
          email.id === selectedEmail.id 
            ? { ...email, is_enquiry: true, associated_lead_id: leadId } 
            : email
        )
      );
      
      toast({
        title: "Enquiry Connected",
        description: "This enquiry has been connected to an existing lead."
      });
      
      setSelectedEmail(null);
      setMatchingLeads([]);
    } catch (error) {
      console.error("Error connecting to lead:", error);
      toast({
        title: "Error",
        description: "Failed to connect enquiry to lead. Please try again.",
      });
    }
  };

  const syncGmailEmails = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    
    toast({
      title: "Syncing Emails",
      description: "Synchronizing with your Gmail account...",
    });
    
    try {
      const response = await supabase.functions.invoke('gmail-auth', {
        method: 'POST',
        body: { path: 'sync-emails' },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${response.data?.count || 0} emails.`,
      });
      
      fetchEmails();
    } catch (error) {
      console.error("Error syncing emails:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync emails from Gmail. Please try again.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredEmails = emails.filter(email => {
    if (filter === 'enquiries' && !email.is_enquiry) return false;
    if (filter === 'unread' && email.read) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(query) ||
        email.sender_name.toLowerCase().includes(query) ||
        email.sender_email.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gmail Enquiries</h1>
        <Button onClick={syncGmailEmails} disabled={isSyncing}>
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Sync Gmail
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Emails</TabsTrigger>
            <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="h-10 w-10 text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading emails...</p>
            </CardContent>
          </Card>
        ) : filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Mail className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No emails found matching your criteria</p>
              {emails.length === 0 && (
                <Button onClick={syncGmailEmails} variant="outline" className="mt-4">
                  Sync emails from Gmail
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card key={email.id} className={`animate-slide-in ${!email.read ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-medium">
                    {email.subject}
                    {email.is_enquiry && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Enquiry
                      </span>
                    )}
                    {email.associated_lead_id && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        Linked to Lead
                      </span>
                    )}
                  </CardTitle>
                  {email.has_attachments && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      Attachment
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-sm">
                    <span className="font-medium">From:</span> {email.sender_name} &lt;{email.sender_email}&gt;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(email.received_at).toLocaleString()}
                  </p>
                </div>
                
                <p className="text-sm line-clamp-3 mb-4">{email.body}</p>
                
                <div className="flex gap-2">
                  {!email.is_enquiry ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMarkAsEnquiry(email.id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Mark as Enquiry
                    </Button>
                  ) : !email.associated_lead_id ? (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          size="sm"
                          onClick={() => handleConvertToLead(email)}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Convert to Lead
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>Create or Connect Lead</SheetTitle>
                        </SheetHeader>
                        
                        {matchingLeads.length > 0 ? (
                          <div className="py-6">
                            <h3 className="text-sm font-medium mb-4">
                              We found potential matching leads:
                            </h3>
                            <div className="space-y-4">
                              {matchingLeads.map(lead => (
                                <div key={lead.id} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium">{lead.name}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {lead.inquiry_type} • {lead.priority} priority
                                      </p>
                                    </div>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleConnectToExistingLead(lead.id)}
                                    >
                                      Connect
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t">
                              <p className="text-sm mb-4">
                                If none of these leads match, you can create a new one:
                              </p>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowLeadCreation(true)}
                              >
                                Create New Lead
                              </Button>
                            </div>
                          </div>
                        ) : showLeadCreation ? (
                          <div className="py-4">
                            <LeadCreationForm 
                              initialData={{
                                name: selectedEmail?.sender_name || "",
                                email: selectedEmail?.sender_email || "",
                                notes: selectedEmail?.body || "",
                                source: "gmail",
                              }}
                              onSuccess={() => {
                                setSelectedEmail(null);
                                setShowLeadCreation(false);
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10">
                            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">No matching leads found</p>
                            <Button onClick={() => setShowLeadCreation(true)}>
                              Create New Lead
                            </Button>
                          </div>
                        )}
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="pointer-events-none opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Connected to Lead
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
