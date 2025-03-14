
import React from "react";
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

        {/* Use Dialog for desktop and Sheet for mobile */}
        {isMobile ? (
          <Sheet open={!!authUrl || !!authError} onOpenChange={(open) => !open && resetAuthUrl()}>
            <SheetContent side="bottom" className="h-[85vh] p-0">
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
              ) : authUrl ? (
                <iframe 
                  src={authUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Microsoft Authentication"
                  onError={() => {
                    console.error("Iframe failed to load");
                  }}
                />
              ) : null}
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={!!authUrl || !!authError} onOpenChange={(open) => !open && resetAuthUrl()}>
            <DialogContent className="p-0 max-w-[800px] h-[600px]">
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
              ) : authUrl ? (
                <iframe 
                  src={authUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Microsoft Authentication"
                  onError={(e) => {
                    console.error("Iframe failed to load", e);
                  }}
                />
              ) : null}
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return null;
}
