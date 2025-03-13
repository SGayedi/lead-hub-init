
import React from "react";
import { RefreshCw, LogIn, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      <Button 
        variant="outline" 
        onClick={syncEmails} 
        disabled={isLoading || !isOutlookConnected}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Sync Emails
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button 
                variant="outline" 
                onClick={authorizeOutlook} 
                disabled={!isConfigComplete}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Connect Outlook
              </Button>
            </span>
          </TooltipTrigger>
          {!isConfigComplete && (
            <TooltipContent>
              <p>Microsoft OAuth configuration is incomplete.</p>
              <p>Please set up MS_CLIENT_ID, MS_CLIENT_SECRET, and REDIRECT_URI.</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <Button>
        <FileText className="mr-2 h-4 w-4" />
        Compose
      </Button>
    </div>
  );
}
