
import { useOutlookEmailFetch } from './useOutlookEmailFetch';
import { useOutlookSync } from './useOutlookSync';
import { useOutlookAuthorization } from './useOutlookAuthorization';
import { OutlookEmail } from '@/types/outlook';

export type { OutlookEmail };

export function useOutlookEmails() {
  const { emails, fetchEmails } = useOutlookEmailFetch();
  const { isLoading: isSyncing, error: syncError, syncEmails } = useOutlookSync();
  const { isLoading: isAuthorizing, configError, authorizeOutlook } = useOutlookAuthorization();

  // Combine loading states
  const isLoading = isSyncing || isAuthorizing;
  
  // Use syncError if available, otherwise use null
  const error = syncError;

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
