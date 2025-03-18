
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { checkOutlookSetup, initiateOutlookAuthorization, listOutlookAccounts, OutlookAccountType } from '@/utils/outlookApi';

export function useOutlookAuthorization() {
  const [isLoading, setIsLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [redirectInfo, setRedirectInfo] = useState<{isHttps: boolean, redirectUri: string, accountType: string, clientId?: string, error?: string} | null>(null);
  const [accountType, setAccountType] = useState<OutlookAccountType>('personal');
  const { toast } = useToast();
  const { user } = useAuth();

  const authorizeOutlook = async (type: OutlookAccountType = 'personal') => {
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
    setAuthError(null);
    setRedirectInfo(null);
    setAccountType(type);
    
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
      
      console.log(`Configuration is valid, proceeding to authorization for ${type} account...`);
      
      // Check if this account type is already connected
      try {
        const accounts = await listOutlookAccounts();
        const isAlreadyConnected = accounts.some(acc => acc.account_type === type);
        
        if (isAlreadyConnected) {
          toast({
            title: "Account Already Connected",
            description: `Your ${type} Outlook account is already connected.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.log("Could not check connected accounts, might be first connection:", err);
        // Continue with the auth flow even if we can't check accounts
      }
      
      // Get the current URL for building the redirect
      const currentUrl = new URL(window.location.href);
      const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
      const callbackUrl = `${baseUrl}/inbox`;
      
      // Get the authorization URL with the account type
      const response = await initiateOutlookAuthorization(type, callbackUrl);
      
      // Check if this is a URL or an object with additional info
      if (typeof response === 'string') {
        // Set the auth URL to be used by the UI
        setAuthUrl(response);
      } else if (typeof response === 'object' && response.url) {
        setAuthUrl(response.url);
        setRedirectInfo({
          isHttps: response.isHttps,
          redirectUri: response.redirectUri,
          accountType: response.accountType || type,
          clientId: response.clientId,
          error: response.error
        });
        
        // If not HTTPS, show a specific error about the URL protocol
        if (response.isHttps === false) {
          setAuthError(
            "Microsoft requires HTTPS for authentication. " +
            "Your application is running on HTTP, which won't work with Microsoft OAuth. " +
            "Please deploy your application with HTTPS or use a service like ngrok for local testing."
          );
        }
      }
      
      toast({
        title: "Authentication Ready",
        description: `Please complete the authentication for your ${type} account in the dialog.`,
      });
      
    } catch (err: any) {
      console.error('Error authorizing with Outlook:', err);
      
      // Check for specific error related to Microsoft client
      const errorMsg = err.message || 'Failed to connect to Outlook';
      setConfigError(errorMsg);
      
      // Check for specific Microsoft error messages
      if (errorMsg.includes('unauthorized_client') || 
          errorMsg.includes('invalid_client') || 
          errorMsg.includes('client does not exist')) {
            
        // Check if this is the specific "not enabled for consumers" error
        if (errorMsg.toLowerCase().includes('not enabled for consumers')) {
          setAuthError(
            "Your Microsoft application is not configured to allow personal Microsoft accounts. " +
            "When registering your application in Azure, you need to select " +
            "'Accounts in any organizational directory and personal Microsoft accounts'."
          );
          
          setRedirectInfo({
            isHttps: true,
            redirectUri: "See Azure Portal",
            accountType: type,
            error: "consumer_accounts_not_enabled"
          });
        } else {
          setAuthError(
            "Microsoft application configuration error: The client ID may be invalid or not configured correctly for " +
            "the type of account you're trying to use. Please check your Microsoft application registration in the Azure portal."
          );
        }
      } else {
        setAuthError(
          "Authentication failed. Please ensure your Microsoft account allows authentication from this domain. " +
          "This could be because Microsoft requires HTTPS for OAuth authentication or the domain isn't registered as a valid redirect URL in your Microsoft application."
        );
      }
      
      toast({
        title: "Authorization Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAuthUrl = () => {
    setAuthUrl(null);
    setAuthError(null);
    setRedirectInfo(null);
  };

  return {
    isLoading,
    configError,
    authUrl,
    authError,
    redirectInfo,
    accountType,
    authorizeOutlook,
    resetAuthUrl
  };
}
