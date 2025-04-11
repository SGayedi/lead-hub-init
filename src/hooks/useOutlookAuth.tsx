
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useOutlookAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleOutlookCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');
      const error_description = params.get('error_description');
      const state = params.get('state');
      
      if (code || error) {
        // Remove the query parameters from URL without changing the path
        navigate(location.pathname, { replace: true });
      }
      
      if (error) {
        console.error("OAuth error:", error, error_description);
        
        // Special handling for unauthorized_client error (personal accounts not enabled)
        if (error === 'unauthorized_client' && 
            (error_description?.includes('not enabled for consumers') || 
             error_description?.includes('AADSTS700016'))) {
          toast({
            title: "Microsoft Account Type Error",
            description: "Your Microsoft application is not configured to allow personal Microsoft accounts. Change your application registration in Azure.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication Failed",
            description: error_description || "Failed to connect your Outlook account. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }
      
      if (code && state) {
        toast({
          title: "Authenticating",
          description: "Completing Outlook authentication...",
        });
        
        try {
          // Extract the account type from the state parameter
          const [userId, accountType = 'personal'] = (state || '').split(':');
          
          // Log the current domain for debugging
          const currentDomain = window.location.origin;
          console.log("Current domain for authentication:", currentDomain);
          console.log("Current protocol:", window.location.protocol);
          
          // Call the edge function to complete the authentication
          const response = await supabase.functions.invoke('microsoft-auth', {
            method: 'POST',
            body: { 
              path: 'callback',
              code,
              state,
              // Pass the full callback URL to ensure it matches what was used for authorization
              callbackUrl: `${currentDomain}/inbox`
            },
          });
          
          if (response.error) {
            throw new Error(response.error.message);
          }
          
          const accountTypeLabel = response.data?.accountType === 'organizational' ? 
            'organization' : 'personal';
          
          toast({
            title: "Success",
            description: `Your Outlook ${accountTypeLabel} account has been connected!`,
          });
          
          // Refresh the current page instead of navigating
          window.location.reload();
        } catch (error: any) {
          console.error("Error in callback processing:", error);
          
          // Special handling for specific errors
          if (error.message?.includes('unauthorized_client') || 
              error.message?.includes('not enabled for consumers')) {
            toast({
              title: "Microsoft Account Type Error",
              description: "Your Microsoft application doesn't support personal accounts. Update your Azure app registration.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Connection Error",
              description: error.message || "Failed to complete Outlook integration. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    };
    
    handleOutlookCallback();
  }, [location.search, navigate, toast]);
}
