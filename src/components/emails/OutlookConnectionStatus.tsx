
import React from "react";
import { RefreshCw, Mail, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface OutlookConnectionStatusProps {
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  authorizeOutlook: () => void;
  authUrl: string | null;
  resetAuthUrl: () => void;
}

export function OutlookConnectionStatus({ 
  isOutlookConnected, 
  isConfigComplete,
  authorizeOutlook,
  authUrl,
  resetAuthUrl
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
          <Sheet open={!!authUrl} onOpenChange={(open) => !open && resetAuthUrl()}>
            <SheetContent side="bottom" className="h-[85vh] p-0">
              {authUrl && (
                <iframe 
                  src={authUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Microsoft Authentication"
                />
              )}
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={!!authUrl} onOpenChange={(open) => !open && resetAuthUrl()}>
            <DialogContent className="p-0 max-w-[800px] h-[600px]">
              {authUrl && (
                <iframe 
                  src={authUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Microsoft Authentication"
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  return null;
}
