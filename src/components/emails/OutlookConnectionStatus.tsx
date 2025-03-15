
import React, { useState, useEffect } from "react";
import { RefreshCw, Mail, LogIn, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OutlookConnectionStatusProps {
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  authorizeOutlook: () => void;
  authUrl: string | null;
  resetAuthUrl: () => void;
  authError?: string | null;
}

export function OutlookConnectionStatus({ 
  isOutlookConnected, 
  isConfigComplete,
  authorizeOutlook,
  authUrl,
  resetAuthUrl,
  authError
}: OutlookConnectionStatusProps) {
  const isMobile = useIsMobile();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // Handle the OAuth authentication opening in a new window
  useEffect(() => {
    let authWindow: Window | null = null;
    
    if (authUrl) {
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
  }, [authUrl, resetAuthUrl]);
  
  useEffect(() => {
    if (!authUrl) {
      setShowAuthPrompt(false);
    }
  }, [authUrl]);

  if (isOutlookConnected === null) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-muted-foreground flex items-center">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Checking connection status...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isOutlookConnected) {
    return (
      <>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center text-foreground">No Outlook Account Connected</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 space-y-4">
            <Mail className="h-24 w-24 text-muted-foreground/30" />
            <p className="text-center text-muted-foreground">
              Connect your Outlook account to view and manage your emails.
            </p>
            <Button onClick={authorizeOutlook} disabled={!isConfigComplete} variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Connect Outlook
              {!isConfigComplete && <span className="ml-2">(Configuration Required)</span>}
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Prompt Dialog/Sheet */}
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
      </>
    );
  }

  return null;
}
