
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Link, LogIn, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOutlookAuth } from "@/hooks/useOutlookAuth";
import { useOutlookEmails } from "@/hooks/useOutlookEmails";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const [microsoftStatus, setMicrosoftStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const { authorizeOutlook, authUrl, resetAuthUrl, authError } = useOutlookEmails();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [domainInfo, setDomainInfo] = useState<{domain: string, isCustomDomain: boolean}>({
    domain: window.location.hostname,
    isCustomDomain: window.location.hostname.includes('afezcrm.com')
  });

  // Process Outlook OAuth callback if present in URL
  useOutlookAuth();

  // Handle the OAuth authentication opening in a new window
  useEffect(() => {
    let authWindow: Window | null = null;
    
    if (authUrl) {
      // Log domain info
      console.log("Domain during OAuth:", domainInfo);
      
      // Open the auth URL in a new window
      authWindow = window.open(authUrl, 'microsoft-auth', 'width=800,height=600');
      
      // Set up a listener to detect when the window is closed
      const checkClosed = setInterval(() => {
        if (authWindow && authWindow.closed) {
          clearInterval(checkClosed);
          resetAuthUrl();
        }
      }, 500);
      
      // Show the auth prompt dialog
      setShowAuthPrompt(true);
      
      // Clean up function
      return () => {
        clearInterval(checkClosed);
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
      };
    }
    
    return undefined;
  }, [authUrl, resetAuthUrl, domainInfo]);
  
  useEffect(() => {
    if (!authUrl) {
      setShowAuthPrompt(false);
    }
  }, [authUrl]);

  // Check if Microsoft is connected
  useEffect(() => {
    async function checkMicrosoftConnection() {
      try {
        // Use the RPC function to check connection status
        const { data, error } = await supabase.rpc('check_outlook_connection');
        
        if (error) throw error;
        
        setMicrosoftStatus(data ? 'connected' : 'disconnected');
      } catch (err) {
        console.error("Error checking Microsoft connection:", err);
        setMicrosoftStatus('disconnected');
      }
    }
    
    checkMicrosoftConnection();
  }, []);

  const handleOutlookConnect = () => {
    // Log the current domain during connection attempt
    console.log("Current domain during connection:", window.location.hostname);
    console.log("Is custom domain:", window.location.hostname.includes('afezcrm.com'));
    
    authorizeOutlook();
  };

  const handleOutlookDisconnect = async () => {
    try {
      // Use the RPC function to disconnect
      const { error } = await supabase.rpc('disconnect_outlook');
      
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
      
      {domainInfo.isCustomDomain && (
        <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-400">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Using custom domain: {domainInfo.domain}
          </AlertDescription>
        </Alert>
      )}
      
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

      {/* Authentication Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={showAuthPrompt || !!authError} onOpenChange={(open) => !open && resetAuthUrl()}>
          <SheetContent side="bottom" className="h-[85vh] p-4">
            {authError ? (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {authError}
                    <p className="mt-2 text-sm">
                      This could be because Microsoft requires HTTPS for OAuth authentication or the domain isn't registered as a valid redirect URL in your Microsoft application.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold mb-4">Microsoft Authentication</h3>
                <p className="mb-6">A new window has been opened for you to sign in with your Microsoft account.</p>
                <p className="text-muted-foreground">Please complete the authentication in the opened window. This dialog will close automatically when you're done.</p>
                <Button 
                  className="mt-8" 
                  variant="outline" 
                  onClick={resetAuthUrl}
                >
                  Cancel Authentication
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={showAuthPrompt || !!authError} onOpenChange={(open) => !open && resetAuthUrl()}>
          <DialogContent className="sm:max-w-[425px]">
            {authError ? (
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle>Authentication Error</DialogTitle>
                </DialogHeader>
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {authError}
                    <p className="mt-2">
                      This could be because Microsoft requires HTTPS for OAuth authentication or the domain isn't registered as a valid redirect URL in your Microsoft application.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-4">
                <DialogHeader>
                  <DialogTitle>Microsoft Authentication</DialogTitle>
                </DialogHeader>
                <div className="mt-6 mb-8">
                  <p className="mb-4">A new window has been opened for you to sign in with your Microsoft account.</p>
                  <p className="text-muted-foreground">Please complete the authentication in the opened window. This dialog will close automatically when you're done.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={resetAuthUrl}
                >
                  Cancel Authentication
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
