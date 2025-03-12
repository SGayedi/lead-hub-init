
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGmailAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleGmailCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');
      const state = params.get('state');
      
      if (code || error) {
        navigate(location.pathname, { replace: true });
      }
      
      if (error) {
        console.error("OAuth error:", error);
        toast({
          title: "Authentication Failed",
          description: "Failed to connect your Gmail account. Please try again.",
        });
        return;
      }
      
      if (code && state) {
        toast({
          title: "Authenticating",
          description: "Completing Gmail authentication...",
        });
        
        try {
          const response = await supabase.functions.invoke('gmail-auth', {
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
            description: "Your Gmail account has been connected!",
          });
          
          navigate('/settings');
        } catch (error) {
          console.error("Error in callback processing:", error);
          toast({
            title: "Connection Error",
            description: "Failed to complete Gmail integration. Please try again.",
          });
        }
      }
    };
    
    handleGmailCallback();
  }, [location.search]);
}
