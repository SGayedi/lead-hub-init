
import { useState, useEffect } from 'react';
import { OutlookEmail } from '@/types/outlook';
import { useToast } from '@/hooks/use-toast';
import { fetchOutlookEmails } from '@/utils/outlookApi';

export function useOutlookEmailFetch() {
  const [emails, setEmails] = useState<OutlookEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmails = async (filter?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchOutlookEmails(filter);
      setEmails(data);
    } catch (err: any) {
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

  return {
    emails,
    isLoading,
    error,
    fetchEmails
  };
}
