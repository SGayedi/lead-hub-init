
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
      let query = supabase
        .from('outlook_emails')
        .select('*')
        .order('received_at', { ascending: false });
      
      // Apply filter if provided
      if (filter) {
        switch (filter) {
          case 'inbox':
            // Emails in the inbox (not archived)
            // This would require a column to track archived status
            // For now, just return all emails
            break;
          case 'sent':
            // Could filter by emails with sender matching user's email
            // Would need to know user's email address
            break;
          case 'drafts':
            // Would need a draft status column
            break;
          case 'archive':
            // Would need an archived status column
            break;
        }
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setEmails(data || []);
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
