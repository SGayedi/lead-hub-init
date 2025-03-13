
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Link, RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutlookAuth } from "@/hooks/useOutlookAuth";
import { useOutlookEmails } from "@/hooks/useOutlookEmails";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [microsoftStatus, setMicrosoftStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const { authorizeOutlook } = useOutlookEmails();
  const { toast } = useToast();

  // Process Outlook OAuth callback if present in URL
  useOutlookAuth();

  // Check if Microsoft is connected
  useEffect(() => {
    async function checkMicrosoftConnection() {
      try {
        // Using function call interface instead of rpc method to avoid type issues
        const { data, error } = await supabase.functions.invoke('check-outlook-connection', {
          method: 'GET'
        });
        
        if (error) throw error;
        
        setMicrosoftStatus(data?.connected ? 'connected' : 'disconnected');
      } catch (err) {
        console.error("Error checking Microsoft connection:", err);
        setMicrosoftStatus('disconnected');
      }
    }
    
    checkMicrosoftConnection();
  }, []);

  const handleOutlookConnect = () => {
    authorizeOutlook();
  };

  const handleOutlookDisconnect = async () => {
    try {
      // Using function call interface instead of rpc method to avoid type issues
      const { error } = await supabase.functions.invoke('disconnect-outlook', {
        method: 'POST'
      });
      
      if (error) throw error;
      
      setMicrosoftStatus('disconnected');
      toast({
        title: "Outlook Disconnected",
        description: "Your Outlook account has been disconnected successfully.",
      });
    } catch (err: any) {
      console.error("Error disconnecting Outlook:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to disconnect Outlook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Integration
            </CardTitle>
            <CardDescription>
              Connect your email accounts to sync messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Microsoft Outlook */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Microsoft Outlook</h3>
                <p className="text-sm text-muted-foreground">
                  {microsoftStatus === 'checking' ? 'Checking connection status...' : 
                   microsoftStatus === 'connected' ? 'Connected' : 'Not connected'}
                </p>
              </div>
              <div>
                {microsoftStatus === 'connected' ? (
                  <Button variant="outline" onClick={handleOutlookDisconnect}>
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={handleOutlookConnect}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Connect Outlook
                  </Button>
                )}
              </div>
            </div>
            
            {/* Gmail - Placeholder for future implementation */}
            <div className="flex justify-between items-center opacity-50">
              <div>
                <h3 className="font-medium">Gmail</h3>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
              <Button variant="outline" disabled>
                Connect Gmail
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-xs text-center text-muted-foreground">
              Email integrations allow you to sync and manage emails directly in the CRM
            </p>
          </CardFooter>
        </Card>

        {/* Application Settings - Placeholder for future settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-6 text-muted-foreground">
              Account settings will be available in a future update
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
