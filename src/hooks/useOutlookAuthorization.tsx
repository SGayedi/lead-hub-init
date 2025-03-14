
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { checkOutlookSetup, initiateOutlookAuthorization } from '@/utils/outlookApi';

export function useOutlookAuthorization() {
  const [isLoading, setIsLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const authorizeOutlook = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to connect Outlook.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setConfigError(null);
    
    try {
      // First check if setup is complete with detailed logging
      const setupData = await checkOutlookSetup();
      
      if (!setupData?.status || setupData.status === 'incomplete') {
        const missingItems = [];
        const details = setupData?.details || {};
        
        if (!details.client_id) missingItems.push('MS_CLIENT_ID');
        if (!details.client_secret) missingItems.push('MS_CLIENT_SECRET');
        if (!details.redirect_uri) missingItems.push('REDIRECT_URI');
        
        const errorMsg = `Missing or invalid Microsoft OAuth configuration: ${missingItems.join(', ')}`;
        console.error(errorMsg);
        setConfigError(errorMsg);
        
        toast({
          title: "Configuration Incomplete",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Configuration is valid, proceeding to authorization...');
      
      // Get the current URL for building the redirect
      const currentUrl = new URL(window.location.href);
      const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
      const callbackUrl = `${baseUrl}/inbox`;
      
      // Pass the callback URL as a parameter so the edge function can use it
      const authUrl = await initiateOutlookAuthorization(callbackUrl);
      
      // Open in a new tab/window to avoid navigating away
      window.open(authUrl, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Authentication Started",
        description: "Please complete authentication in the new window and return to this page.",
      });
      
    } catch (err: any) {
      console.error('Error authorizing with Outlook:', err);
      const errorMsg = err.message || 'Failed to connect to Outlook';
      setConfigError(errorMsg);
      toast({
        title: "Authorization Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    configError,
    authorizeOutlook
  };
}
