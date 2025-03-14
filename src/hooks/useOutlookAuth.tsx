
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
        // Remove the query parameters from URL
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
          // Call the edge function to complete the authentication
          const response = await supabase.functions.invoke('microsoft-auth', {
            method: 'POST',
            body: { 
              path: 'callback',
              code,
              state
            },
          });
          
          if (response.error) {
            throw new Error(response.error.message);
          }
          
          toast({
            title: "Success",
            description: "Your Outlook account has been connected!",
          });
          
          // Instead of redirecting, just show a success message and reload the emails
          // The parent window should handle refreshing the UI
          if (window.opener) {
            window.opener.postMessage({ type: 'OUTLOOK_AUTH_SUCCESS' }, '*');
            window.close();
          }
        } catch (error) {
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
