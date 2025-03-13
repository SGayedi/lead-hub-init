
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OutlookEmail {
  id: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  received_at: string;
  body: string;
  read: boolean;
  has_attachments: boolean;
  is_enquiry: boolean;
  associated_lead_id?: string;
}

export function useOutlookEmails() {
  const [emails, setEmails] = useState<OutlookEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const syncEmails = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to sync emails.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call the Edge Function to sync emails
      const { data, error } = await supabase.functions.invoke('microsoft-auth', {
        method: 'POST',
        body: { path: 'sync-emails' },
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
      }
      
      if (data.success) {
        toast({
          title: "Emails Synchronized",
          description: `Successfully synced ${data.count} emails.`,
        });
        
        // Fetch the emails from the database
        await fetchEmails();
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Error syncing emails:', err);
      const errorMessage = err.message || 'Failed to sync emails';
      setError(errorMessage);
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmails = async (filter?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the RPC function to get emails
      const { data, error: fetchError } = await supabase
        .rpc('get_outlook_emails') as { data: OutlookEmail[] | null, error: any };
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setEmails(data);
      } else {
        setEmails([]);
      }
    } catch (err: any) {
      console.error('Error fetching emails:', err);
      setError(err.message || 'Failed to fetch emails');
      toast({
        title: "Error",
        description: err.message || 'Failed to fetch emails',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      // First check if setup is complete
      const { data: setupData, error: setupError } = await supabase.functions.invoke('microsoft-auth', {
        method: 'POST',
        body: { path: 'check-setup' },
      });
      
      if (setupError) {
        console.error('Error checking setup:', setupError);
        throw new Error(`Configuration check failed: ${setupError.message || 'Unknown error'}`);
      }
      
      if (!setupData?.status || setupData.status === 'incomplete') {
        const missingItems = [];
        const details = setupData?.details || {};
        
        if (!details.client_id) missingItems.push('MS_CLIENT_ID');
        if (!details.client_secret) missingItems.push('MS_CLIENT_SECRET');
        if (!details.redirect_uri) missingItems.push('REDIRECT_URI');
        
        const errorMsg = `Missing configuration: ${missingItems.join(', ')}`;
        setConfigError(errorMsg);
        
        toast({
          title: "Configuration Incomplete",
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Call the authorization endpoint to get the OAuth URL
      const { data, error } = await supabase.functions.invoke('microsoft-auth', {
        method: 'POST',
        body: { path: 'authorize' },
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(`Authorization failed: ${error.message || 'Unknown error'}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.url) {
        // Redirect to Microsoft's OAuth page
        window.location.href = data.url;
      } else {
        throw new Error('No authorization URL returned');
      }
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
    emails,
    isLoading,
    error,
    configError,
    syncEmails,
    fetchEmails,
    authorizeOutlook
  };
}
