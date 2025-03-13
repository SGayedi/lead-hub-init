
import React from "react";
import { RefreshCw, LogIn, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailToolbarProps {
  syncEmails: () => void;
  authorizeOutlook: () => void;
  isLoading: boolean;
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
}

export function EmailToolbar({ 
  syncEmails, 
  authorizeOutlook, 
  isLoading,
  isOutlookConnected,
  isConfigComplete
}: EmailToolbarProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={syncEmails} disabled={isLoading || !isOutlookConnected}>
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Sync Emails
      </Button>
      <Button variant="outline" onClick={authorizeOutlook} disabled={!isConfigComplete}>
        <LogIn className="mr-2 h-4 w-4" />
        Connect Outlook
      </Button>
      <Button>
        <FileText className="mr-2 h-4 w-4" />
        Compose
      </Button>
    </div>
  );
}
