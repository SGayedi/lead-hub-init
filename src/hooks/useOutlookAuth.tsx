
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
      const state = params.get('state');
      
      if (code || error) {
        // Remove the query parameters from URL without changing the path
        navigate(location.pathname, { replace: true });
      }
      
      if (error) {
        console.error("OAuth error:", error);
        toast({
          title: "Authentication Failed",
          description: "Failed to connect your Outlook account. Please try again.",
          variant: "destructive",
        });
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
          const currentDomain = window.location.hostname;
          console.log("Current domain for authentication:", currentDomain);
          
          // Call the edge function to complete the authentication
          const response = await supabase.functions.invoke('microsoft-auth', {
            method: 'POST',
            body: { 
              path: 'callback',
              code,
              state,
              // Pass the callbackUrl if on custom domain
              callbackUrl: currentDomain.includes('afezcrm.com') ? 'https://afezcrm.com/inbox' : undefined
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
          toast({
            title: "Connection Error",
            description: error.message || "Failed to complete Outlook integration. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    
    handleOutlookCallback();
  }, [location.search, navigate, toast]);
}
