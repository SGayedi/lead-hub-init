
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { OutlookEmail, Lead } from "@/types/crm";
import { Search, Mail, ArrowRight, Flag, CheckCircle, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LeadCreationForm } from "@/components/LeadCreationForm";

// Mock data for demonstration
const mockEmails: OutlookEmail[] = [
  {
    id: "1",
    subject: "Investment Opportunity Discussion",
    senderName: "John Smith",
    senderEmail: "john.smith@example.com",
    receivedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    body: "Hello, I'm interested in discussing potential investment opportunities in your development projects. Our company is looking to invest in real estate with export quotas above 80%. Please let me know if we can arrange a meeting to discuss further details.",
    read: true,
    hasAttachments: false,
    isEnquiry: false,
  },
  {
    id: "2",
    subject: "Plot Size Inquiry",
    senderName: "Maria Rodriguez",
    senderEmail: "maria@company.co",
    receivedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    body: "I'm writing to inquire about available plots in your development areas. We are particularly interested in sizes larger than 1.5 hectares. Could you send me information about what's currently available?",
    read: false,
    hasAttachments: true,
    isEnquiry: true,
  },
  {
    id: "3",
    subject: "Legal Services Requirements",
    senderName: "Alex Johnson",
    senderEmail: "alex.johnson@legalfirm.com",
    receivedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    body: "Our legal firm would like to offer our services for your development projects. We specialize in real estate and investment law and have extensive experience with international clients.",
    read: true,
    hasAttachments: false,
    isEnquiry: true,
  }
];

// Mock existing leads for matching
const mockExistingLeads: Lead[] = [
  {
    id: "1",
    name: "Acme Corp",
    inquiryType: "company",
    priority: "high",
    source: "referral",
    status: "active",
    exportQuota: 80,
    plotSize: 2,
    email: "info@acme.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Legal Services LLC",
    inquiryType: "company",
    priority: "medium",
    source: "direct",
    status: "active",
    email: "contact@legalservices.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function Enquiries() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<OutlookEmail[]>(mockEmails);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<OutlookEmail | null>(null);
  const [matchingLeads, setMatchingLeads] = useState<Lead[]>([]);
  const [showLeadCreation, setShowLeadCreation] = useState(false);
  const [filter, setFilter] = useState<'all' | 'enquiries' | 'unread'>('all');

  const handleMarkAsEnquiry = (emailId: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === emailId 
          ? { ...email, isEnquiry: true } 
          : email
      )
    );
    
    toast({
      title: "Marked as Enquiry",
      description: "The email has been marked as an enquiry."
    });

    // Simulate finding matching leads
    if (emailId === "1") {
      setMatchingLeads([mockExistingLeads[0]]);
    } else if (emailId === "3") {
      setMatchingLeads([mockExistingLeads[1]]);
    } else {
      setMatchingLeads([]);
    }
  };

  const handleConvertToLead = (email: OutlookEmail) => {
    setSelectedEmail(email);
    
    // Check for matching leads based on email domain or name
    const potentialMatches = mockExistingLeads.filter(lead => 
      lead.email?.includes(email.senderEmail.split('@')[1]) || 
      lead.name.toLowerCase().includes(email.senderName.toLowerCase())
    );
    
    setMatchingLeads(potentialMatches);
    
    if (potentialMatches.length > 0) {
      toast({
        title: "Potential Matches Found",
        description: "We found existing leads that might match this enquiry."
      });
    } else {
      setShowLeadCreation(true);
    }
  };

  const handleConnectToExistingLead = (leadId: string) => {
    if (!selectedEmail) return;
    
    // In a real app, you would update the database here
    toast({
      title: "Enquiry Connected",
      description: "This enquiry has been connected to an existing lead."
    });
    
    // Update local state to reflect the connection
    setEmails(prev => 
      prev.map(email => 
        email.id === selectedEmail.id 
          ? { ...email, isEnquiry: true, associatedLeadId: leadId } 
          : email
      )
    );
    
    setSelectedEmail(null);
    setMatchingLeads([]);
  };

  const syncOutlookEmails = () => {
    toast({
      title: "Syncing Emails",
      description: "Synchronizing with your Outlook account..."
    });
    
    // Simulate sync completion after a delay
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "Your emails have been synchronized."
      });
    }, 1500);
  };

  const filteredEmails = emails.filter(email => {
    if (filter === 'enquiries' && !email.isEnquiry) return false;
    if (filter === 'unread' && email.read) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(query) ||
        email.senderName.toLowerCase().includes(query) ||
        email.senderEmail.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Outlook Enquiries</h1>
        <Button onClick={syncOutlookEmails}>
          <Mail className="h-4 w-4 mr-2" />
          Sync Outlook
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
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Mail className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No emails found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card key={email.id} className={`animate-slide-in ${!email.read ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-medium">
                    {email.subject}
                    {email.isEnquiry && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Enquiry
                      </span>
                    )}
                    {email.associatedLeadId && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        Linked to Lead
                      </span>
                    )}
                  </CardTitle>
                  {email.hasAttachments && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      Attachment
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-sm">
                    <span className="font-medium">From:</span> {email.senderName} &lt;{email.senderEmail}&gt;
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(email.receivedAt).toLocaleString()}
                  </p>
                </div>
                
                <p className="text-sm line-clamp-3 mb-4">{email.body}</p>
                
                <div className="flex gap-2">
                  {!email.isEnquiry ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMarkAsEnquiry(email.id)}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Mark as Enquiry
                    </Button>
                  ) : !email.associatedLeadId ? (
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
                                        {lead.inquiryType} • {lead.priority} priority
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
                                name: selectedEmail?.senderName || "",
                                email: selectedEmail?.senderEmail || "",
                                notes: selectedEmail?.body || "",
                                source: "outlook",
                              }}
                              onSuccess={() => {
                                setSelectedEmail(null);
                                setShowLeadCreation(false);
                                
                                // Update the email to show it's connected to a lead
                                if (selectedEmail) {
                                  setEmails(prev => 
                                    prev.map(email => 
                                      email.id === selectedEmail.id 
                                        ? { ...email, associatedLeadId: "new-lead-id" } 
                                        : email
                                    )
                                  );
                                }
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
