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
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Emails Synchronized",
          description: `Successfully synced ${data.count} emails.`,
        });
        
        // Fetch the emails from the database
        await fetchEmails();
      }
    } catch (err: any) {
      console.error('Error syncing emails:', err);
      setError(err.message || 'Failed to sync emails');
      toast({
        title: "Sync Failed",
        description: err.message || 'Failed to sync emails from Outlook',
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
      // Use a raw SQL query to bypass TypeScript type checking
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
    
    try {
      // Call the authorization endpoint to get the OAuth URL
      const { data, error } = await supabase.functions.invoke('microsoft-auth', {
        method: 'POST',
        body: { path: 'authorize' },
      });
      
      if (error) throw error;
      
      if (data.url) {
        // Redirect to Microsoft's OAuth page
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error authorizing with Outlook:', err);
      toast({
        title: "Authorization Failed",
        description: err.message || 'Failed to connect to Outlook',
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
    syncEmails,
    fetchEmails,
    authorizeOutlook
  };
}
