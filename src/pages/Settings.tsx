import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Mail, Lock, Bell, HelpCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkOutlookConnection();
    }
  }, [user]);

  const checkOutlookConnection = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('outlook_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        setOutlookConnected(true);
      }
    } catch (error) {
      console.error("Error checking Outlook connection:", error);
    }
  };

  const handleOutlookConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Outlook account.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('microsoft-auth', {
        method: 'POST',
        body: { path: 'authorize' },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Error connecting to Outlook:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Outlook. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOutlookDisconnect = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('outlook_tokens')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setOutlookConnected(false);
      
      toast({
        title: "Disconnected",
        description: "Your Outlook account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting Outlook:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect your Outlook account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncOutlookEmails = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    toast({
      title: "Syncing Emails",
      description: "Synchronizing with your Outlook account...",
    });
    
    try {
      const response = await supabase.functions.invoke('microsoft-auth', {
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
    } catch (error) {
      console.error("Error syncing emails:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync emails from Outlook. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Language
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Your role" disabled value="Senior Management" />
                </div>
                <Button className="w-fit">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications when there's activity on your leads.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Approval Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a lead requires your approval.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Enquiry Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Be alerted when new enquiries are received from Outlook.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 max-w-xl">
                <div>
                  <h3 className="text-lg font-medium mb-2">Microsoft Outlook Integration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Outlook account to sync emails and create leads from your inbox.
                  </p>
                  
                  {outlookConnected ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">
                          Connected
                        </div>
                        <span className="text-sm">{user?.email}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={syncOutlookEmails}
                          disabled={isLoading}
                        >
                          Sync Emails
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleOutlookDisconnect}
                          disabled={isLoading}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleOutlookConnect} disabled={isLoading}>
                      <Mail className="mr-2 h-4 w-4" />
                      Connect Outlook
                    </Button>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">Email Sync Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-sync new emails</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync new emails from your connected account
                        </p>
                      </div>
                      <Switch defaultChecked disabled={!outlookConnected} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-create enquiries</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically create enquiries from new emails
                        </p>
                      </div>
                      <Switch disabled={!outlookConnected} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button className="w-fit">Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="language">Interface Language</Label>
                  <LanguageSelect />
                </div>
                <p className="text-sm text-muted-foreground">
                  The CRM supports English, Russian, Turkish, and Azerbaijani. 
                  Changing the language will update all interface text.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

