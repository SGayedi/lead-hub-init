
import React, { useState, useEffect } from "react";
import { RefreshCw, Mail, LogIn, AlertTriangle, Briefcase, Shield, Link, User, Users, Info } from "lucide-react";
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
  redirectInfo?: {isHttps: boolean, redirectUri: string, accountType: string, clientId?: string, error?: string} | null;
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

  const renderMicrosoftError = () => {
    // Handle the specific "consumer accounts not enabled" error scenario
    if (redirectInfo?.error === "consumer_accounts_not_enabled" || 
        (authError && (authError.includes("not enabled for consumers") || 
                       authError.includes("not configured to allow personal Microsoft accounts")))) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Microsoft Application Configuration Error</AlertTitle>
            <AlertDescription>
              <p className="mt-2">
                Your Microsoft application is not configured to allow personal Microsoft accounts.
              </p>
              
              <div className="mt-4">
                <p className="font-semibold">To fix this error:</p>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                  <li className="mt-2">
                    Go to the <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" 
                      target="_blank" rel="noopener noreferrer" className="underline">
                      Azure Portal App Registrations
                    </a>
                  </li>
                  <li>
                    Click on your existing application or create a new one
                  </li>
                  <li className="font-medium text-red-600 dark:text-red-400">
                    Under "Supported account types", select:
                    <div className="bg-muted p-2 rounded mt-2 text-foreground">
                      <strong>Accounts in any organizational directory and personal Microsoft accounts</strong>
                    </div>
                  </li>
                  <li>
                    <img 
                      src="/lovable-uploads/e6c97d15-08ec-4dba-b4b9-253c894e768b.png" 
                      alt="Microsoft account type selection screen" 
                      className="border rounded mt-2 mb-2 max-w-full"
                    />
                    <p className="text-sm mt-1">
                      You currently have selected "Accounts in any organizational directory" which 
                      does not include personal accounts
                    </p>
                  </li>
                  <li>
                    After changing this setting, you'll need to update your client ID and secret
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    // Cases for different error types
    if (authError && redirectInfo) {
      const { accountType = 'personal', clientId } = redirectInfo;
      
      // Check for unauthorized_client error (common error shown in the screenshot)
      if (authError.includes("unauthorized_client") || authError.includes("client does not exist")) {
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Microsoft Application Error</AlertTitle>
              <AlertDescription>
                <p className="mt-2">
                  The Microsoft OAuth application is not configured correctly for {accountType === 'personal' ? 'personal' : 'organizational'} accounts.
                </p>
                
                <div className="mt-4">
                  <p className="font-semibold">Steps to fix "unauthorized_client" error:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-2">
                    <li className="mt-2">
                      Go to the <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" 
                        target="_blank" rel="noopener noreferrer" className="underline">
                        Azure Portal App Registrations
                      </a>
                    </li>
                    <li>
                      Check that your Client ID is correct{clientId ? ` (current: ${clientId})` : ''}
                    </li>
                    <li>
                      Ensure your application is registered for the right type of accounts:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {accountType === 'personal' ? (
                          <li className="py-1 text-red-600 dark:text-red-400 font-medium">
                            <User className="h-4 w-4 inline mr-1" />
                            "Accounts in any organizational directory and personal Microsoft accounts"
                          </li>
                        ) : (
                          <li className="py-1 text-red-600 dark:text-red-400 font-medium">
                            <Users className="h-4 w-4 inline mr-1" />
                            "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"
                          </li>
                        )}
                      </ul>
                    </li>
                    <li>
                      Verify Microsoft Graph API permissions include:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>offline_access</li>
                        <li>Mail.Read</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Microsoft App Registration Guide</AlertTitle>
              <AlertDescription>
                <p className="mt-2">For a quick guide on setting up Microsoft OAuth:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Create a new app registration in Azure Portal</li>
                  <li>Select the proper account types (including personal accounts)</li>
                  <li>Add your redirect URI: <span className="font-mono bg-muted p-1 text-xs rounded">{redirectInfo.redirectUri}</span></li>
                  <li>Add the required API permissions (Mail.Read)</li>
                  <li>Create a client secret and save it with your client ID</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        );
      }
      
      // General error case with redirect info
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {authError}
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertTitle>Authentication Requirements</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <p>
                  <strong>Account type:</strong> {accountType === 'personal' ? 'Personal' : 'Organizational'}
                </p>
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
        </div>
      );
    }
    
    // Simple error without redirect info
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {authError || "An error occurred during authentication"}
        </AlertDescription>
      </Alert>
    );
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
                  <User className="h-8 w-8" />
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
                <div className="p-4 space-y-6 overflow-y-auto max-h-[80vh]">
                  {renderMicrosoftError()}
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
            <DialogContent className={authError ? "sm:max-w-[600px]" : "sm:max-w-[425px]"}>
              {authError ? (
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Microsoft Authentication Error</DialogTitle>
                  </DialogHeader>
                  
                  {renderMicrosoftError()}
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
