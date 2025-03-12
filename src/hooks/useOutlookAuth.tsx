
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
      // Check if URL contains parameters from the OAuth callback
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');
      const state = params.get('state');
      
      // Clear the URL parameters
      if (code || error) {
        navigate(location.pathname, { replace: true });
      }
      
      if (error) {
        console.error("OAuth error:", error);
        toast({
          title: "Authentication Failed",
          description: "Failed to connect your Outlook account. Please try again.",
        });
        return;
      }
      
      if (code && state) {
        toast({
          title: "Authenticating",
          description: "Completing Outlook authentication...",
        });
        
        try {
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
          
          // Redirect to settings page
          navigate('/settings');
        } catch (error) {
          console.error("Error in callback processing:", error);
          toast({
            title: "Connection Error",
            description: "Failed to complete Outlook integration. Please try again.",
          });
        }
      }
    };
    
    handleOutlookCallback();
  }, [location.search]);
}
