
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { syncOutlookEmails } from '@/utils/outlookApi';

export function useOutlookSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const syncEmails = async (accountType: string = 'personal') => {
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
      const data = await syncOutlookEmails(accountType);
      
      if (data.success) {
        const accountLabel = accountType === 'organizational' ? 'organization' : 'personal';
        
        toast({
          title: "Emails Synchronized",
          description: `Successfully synced ${data.count} emails from your ${accountLabel} account.`,
        });
        
        return true;
      } else if (data.error) {
        throw new Error(data.error);
      }
      
      return false;
    } catch (err: any) {
      console.error('Error syncing emails:', err);
      const errorMessage = err.message || 'Failed to sync emails';
      setError(errorMessage);
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    syncEmails,
  };
}
