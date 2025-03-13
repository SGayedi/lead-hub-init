
import React from "react";
import { RefreshCw, Mail, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OutlookConnectionStatusProps {
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  authorizeOutlook: () => void;
}

export function OutlookConnectionStatus({ 
  isOutlookConnected, 
  isConfigComplete,
  authorizeOutlook
}: OutlookConnectionStatusProps) {
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
    );
  }

  return null;
}
