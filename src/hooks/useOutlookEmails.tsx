
import { useState, useEffect } from 'react';
import { useOutlookEmailFetch } from './useOutlookEmailFetch';
import { useOutlookSync } from './useOutlookSync';
import { useOutlookAuthorization } from './useOutlookAuthorization';
import { OutlookEmail } from '@/types/outlook';
import { listOutlookAccounts, disconnectOutlookAccount } from '@/utils/outlookApi';
import { toast } from 'sonner';

export type { OutlookEmail };

export function useOutlookEmails() {
  const [connectedAccounts, setConnectedAccounts] = useState<Array<{account_type: string, expires_at: string}>>([]);
  const { emails, fetchEmails } = useOutlookEmailFetch();
  const { isLoading: isSyncing, error: syncError, syncEmails } = useOutlookSync();
  const { 
    isLoading: isAuthorizing, 
    configError, 
    authUrl, 
    authError,
    accountType,
    authorizeOutlook, 
    resetAuthUrl 
  } = useOutlookAuthorization();

  // Fetch connected accounts
  useEffect(() => {
    const getAccounts = async () => {
      try {
        const accounts = await listOutlookAccounts();
        setConnectedAccounts(accounts);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };
    
    getAccounts();
  }, []);
  
  // Function to disconnect a specific account
  const disconnectAccount = async (accountType: 'personal' | 'organizational') => {
    try {
      await disconnectOutlookAccount(accountType);
      // Update the connected accounts list
      setConnectedAccounts(prev => prev.filter(acc => acc.account_type !== accountType));
      toast.success(`${accountType === 'personal' ? 'Personal' : 'Organizational'} account disconnected`);
      return true;
    } catch (err: any) {
      console.error('Error disconnecting account:', err);
      toast.error(`Failed to disconnect account: ${err.message}`);
      return false;
    }
  };

  // Combine loading states
  const isLoading = isSyncing || isAuthorizing;
  
  // Use syncError if available, otherwise use null
  const error = syncError;

  // Check if any account is connected
  const isOutlookConnected = connectedAccounts.length > 0;

  return {
    emails,
    isLoading,
    error,
    configError,
    authUrl,
    authError,
    accountType,
    connectedAccounts,
    isOutlookConnected,
    syncEmails,
    fetchEmails,
    authorizeOutlook,
    resetAuthUrl,
    disconnectAccount
  };
}
