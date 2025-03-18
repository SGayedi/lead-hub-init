
import React, { useState, useEffect } from "react";
import { RefreshCw, Mail, LogIn, AlertTriangle, Briefcase, Shield, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface OutlookConnectionStatusProps {
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  authorizeOutlook: (type: 'personal' | 'organizational') => void;
  authUrl: string | null;
  resetAuthUrl: () => void;
  authError?: string | null;
  accountType: 'personal' | 'organizational';
  connectedAccounts?: Array<{account_type: string}>;
  redirectInfo?: {isHttps: boolean, redirectUri: string} | null;
}

export function OutlookConnectionStatus({ 
  isOutlookConnected, 
  isConfigComplete,
  authorizeOutlook,
  authUrl,
  resetAuthUrl,
  authError,
  accountType,
  connectedAccounts = [],
  redirectInfo
}: OutlookConnectionStatusProps) {
  const isMobile = useIsMobile();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    let authWindow: Window | null = null;
    
    if (authUrl) {
      authWindow = window.open(authUrl, 'microsoft-auth', 'width=800,height=600');
      
      const checkClosed = setInterval(() => {
        if (authWindow && authWindow.closed) {
          clearInterval(checkClosed);
          resetAuthUrl();
        }
      }, 500);
      
      setShowAuthPrompt(true);
      
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

  const handleConnect = (type: 'personal' | 'organizational') => {
    setShowAccountPicker(false);
    authorizeOutlook(type);
  };

  const showAccountTypeSelector = () => {
    // Try to determine which accounts are already connected
    let hasPersonal, hasOrganizational;
    
    try {
      hasPersonal = connectedAccounts.some(acc => acc.account_type === 'personal');
      hasOrganizational = connectedAccounts.some(acc => acc.account_type === 'organizational');
    } catch (err) {
      // If we can't determine accounts, assume none are connected
      hasPersonal = false;
      hasOrganizational = false;
    }
    
    if (hasPersonal && hasOrganizational) {
      toast({
        title: "All Account Types Connected",
        description: "You have already connected both personal and organizational accounts.",
      });
      return;
    }
    
    if (hasPersonal && !hasOrganizational) {
      authorizeOutlook('organizational');
      return;
    }
    
    if (!hasPersonal && hasOrganizational) {
      authorizeOutlook('personal');
      return;
    }
    
    setShowAccountPicker(true);
  };

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
            <Button onClick={showAccountTypeSelector} disabled={!isConfigComplete} variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Connect Outlook
              {!isConfigComplete && <span className="ml-2">(Configuration Required)</span>}
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showAccountPicker} onOpenChange={setShowAccountPicker}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Choose Account Type</DialogTitle>
            </DialogHeader>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Please select the type of Microsoft account you want to connect:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => handleConnect('personal')}
                >
                  <Mail className="h-8 w-8" />
                  <span>Personal Account</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => handleConnect('organizational')}
                >
                  <Briefcase className="h-8 w-8" />
                  <span>Work/School Account</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {isMobile ? (
          <Sheet open={showAuthPrompt || !!authError} onOpenChange={(open) => !open && resetAuthUrl()}>
            <SheetContent side="bottom" className="h-[85vh] p-4">
              {authError ? (
                <div className="p-4 space-y-6">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {authError}
                    </AlertDescription>
                  </Alert>
                  
                  {/* Additional guidance if we have redirect info */}
                  {redirectInfo && (
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertTitle>Authentication Requirements</AlertTitle>
                        <AlertDescription>
                          <div className="mt-2 space-y-2">
                            <p>
                              <strong>Current redirect URL:</strong> {redirectInfo.redirectUri}
                            </p>
                            <p>
                              <strong>Protocol:</strong> {redirectInfo.isHttps ? 'HTTPS ✓' : 'HTTP ✗'}
                            </p>
                            
                            {!redirectInfo.isHttps && (
                              <p className="text-red-500">
                                Microsoft requires HTTPS for authentication. Your application is currently using HTTP.
                              </p>
                            )}
                            
                            <div className="mt-4">
                              <p className="font-semibold">How to fix this:</p>
                              <ol className="list-decimal list-inside mt-2 space-y-1">
                                <li>Make sure your application is served over HTTPS</li>
                                <li>Register your exact redirect URL in your Microsoft application</li>
                                <li>Wait until your HTTPS certificates are fully propagated</li>
                              </ol>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-semibold mb-4">Microsoft Authentication</h3>
                  <p className="mb-6">A new window has been opened for you to sign in with your Microsoft {accountType} account.</p>
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
                <div className="p-6 space-y-6">
                  <DialogHeader>
                    <DialogTitle>Authentication Error</DialogTitle>
                  </DialogHeader>
                  
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {authError}
                    </AlertDescription>
                  </Alert>
                  
                  {/* Additional guidance if we have redirect info */}
                  {redirectInfo && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Authentication Requirements</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-2">
                          <p>
                            <strong>Current redirect URL:</strong> {redirectInfo.redirectUri}
                          </p>
                          <p>
                            <strong>Protocol:</strong> {redirectInfo.isHttps ? 'HTTPS ✓' : 'HTTP ✗'}
                          </p>
                          
                          {!redirectInfo.isHttps && (
                            <p className="text-red-500">
                              Microsoft requires HTTPS for authentication. Your application is currently using HTTP.
                            </p>
                          )}
                          
                          <div className="mt-4">
                            <p className="font-semibold">How to fix this:</p>
                            <ol className="list-decimal list-inside mt-2 space-y-1">
                              <li>Make sure your application is served over HTTPS</li>
                              <li>Register the exact redirect URL in the Microsoft Azure portal</li>
                              <li>
                                <p>The URL to register is:</p>
                                <p className="bg-muted p-2 mt-1 rounded text-sm break-all">
                                  {redirectInfo.redirectUri}
                                </p>
                              </li>
                            </ol>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <DialogHeader>
                    <DialogTitle>Microsoft Authentication</DialogTitle>
                  </DialogHeader>
                  <div className="mt-6 mb-8">
                    <p className="mb-4">A new window has been opened for you to sign in with your Microsoft {accountType} account.</p>
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
