
import React from "react";
import { RefreshCw, LogIn, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Briefcase } from "lucide-react";

interface EmailToolbarProps {
  syncEmails: (accountType?: string) => void;
  authorizeOutlook: (type: 'personal' | 'organizational') => void;
  isLoading: boolean;
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  configError?: string | null;
  connectedAccounts?: Array<{account_type: string}>;
}

export function EmailToolbar({ 
  syncEmails, 
  authorizeOutlook, 
  isLoading,
  isOutlookConnected,
  isConfigComplete,
  configError,
  connectedAccounts = []
}: EmailToolbarProps) {
  const [showAccountPicker, setShowAccountPicker] = React.useState(false);
  const [syncAccountType, setSyncAccountType] = React.useState<string | null>(null);
  
  const handleSyncEmails = () => {
    // If only one account is connected, sync that one directly
    if (connectedAccounts.length === 1) {
      syncEmails(connectedAccounts[0].account_type);
      return;
    }
    
    // If multiple accounts are connected, show the picker
    if (connectedAccounts.length > 0) {
      setSyncAccountType('sync');
      setShowAccountPicker(true);
    } else {
      // If no accounts are connected, sync the default account (though this shouldn't happen)
      syncEmails();
    }
  };
  
  const handleAddAccount = () => {
    // Check which account types are already connected
    const hasPersonal = connectedAccounts.some(acc => acc.account_type === 'personal');
    const hasOrganizational = connectedAccounts.some(acc => acc.account_type === 'organizational');
    
    // If both are connected, show a message
    if (hasPersonal && hasOrganizational) {
      toast({
        title: "All Account Types Connected",
        description: "You have already connected both personal and organizational accounts.",
      });
      return;
    }
    
    // If only one is connected, connect the other one directly
    if (hasPersonal && !hasOrganizational) {
      authorizeOutlook('organizational');
      return;
    }
    
    if (!hasPersonal && hasOrganizational) {
      authorizeOutlook('personal');
      return;
    }
    
    // If none are connected, show the picker
    setSyncAccountType('connect');
    setShowAccountPicker(true);
  };
  
  const handleAccountSelect = (type: 'personal' | 'organizational') => {
    setShowAccountPicker(false);
    
    if (syncAccountType === 'sync') {
      syncEmails(type);
    } else if (syncAccountType === 'connect') {
      authorizeOutlook(type);
    }
  };
  
  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleSyncEmails} 
          disabled={isLoading || !isOutlookConnected || connectedAccounts.length === 0}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Emails
        </Button>
        
        {/* Show add account button when at least one account is connected but not all account types */}
        {isOutlookConnected && connectedAccounts.length > 0 && connectedAccounts.length < 2 ? (
          <Button 
            variant="outline" 
            onClick={handleAddAccount}
            disabled={!isConfigComplete}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button 
                    variant="outline" 
                    onClick={handleAddAccount} 
                    disabled={!isConfigComplete || connectedAccounts.length >= 2}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Connect Outlook
                  </Button>
                </span>
              </TooltipTrigger>
              {!isConfigComplete && (
                <TooltipContent>
                  <p>Microsoft OAuth configuration is incomplete.</p>
                  <p>{configError || "Please set up MS_CLIENT_ID, MS_CLIENT_SECRET, and REDIRECT_URI."}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
        
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>
      
      {/* Account Picker Dialog */}
      <Dialog open={showAccountPicker} onOpenChange={setShowAccountPicker}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {syncAccountType === 'sync' ? 'Choose Account to Sync' : 'Choose Account Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              {syncAccountType === 'sync'
                ? 'Select which account you want to sync emails from:'
                : 'Please select the type of Microsoft account you want to connect:'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(syncAccountType === 'connect' || 
                (syncAccountType === 'sync' && connectedAccounts.some(acc => acc.account_type === 'personal'))) && (
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => handleAccountSelect('personal')}
                >
                  <Mail className="h-8 w-8" />
                  <span>Personal Account</span>
                </Button>
              )}
              
              {(syncAccountType === 'connect' || 
                (syncAccountType === 'sync' && connectedAccounts.some(acc => acc.account_type === 'organizational'))) && (
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => handleAccountSelect('organizational')}
                >
                  <Briefcase className="h-8 w-8" />
                  <span>Work/School Account</span>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
