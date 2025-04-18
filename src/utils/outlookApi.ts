
import { supabase } from '@/integrations/supabase/client';

// Define the account type to ensure consistency across all functions
export type OutlookAccountType = 'personal' | 'organizational';

// Check if Outlook configuration is complete
export async function checkOutlookSetup() {
  try {
    const response = await supabase.functions.invoke('microsoft-auth', {
      method: 'POST',
      body: { path: 'check-setup' },
    });
    
    console.log('Check setup response:', response);
    
    if (response.error) {
      console.error('Error checking setup:', response.error);
      throw new Error(`Configuration check failed: ${response.error.message || 'Unknown error'}`);
    }
    
    return response.data;
  } catch (err: any) {
    console.error('Error checking Outlook setup:', err);
    throw err;
  }
}

// Call the Edge Function to sync emails
export async function syncOutlookEmails(accountType: OutlookAccountType = 'personal') {
  try {
    const { data, error } = await supabase.functions.invoke('microsoft-auth', {
      method: 'POST',
      body: { path: 'sync-emails', accountType },
    });
    
    if (error) {
      console.error('Error from edge function:', error);
      throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (err: any) {
    console.error('Error syncing emails:', err);
    throw err;
  }
}

// Fetch emails from the database
export async function fetchOutlookEmails(filter?: string) {
  try {
    const { data, error: fetchError } = await supabase
      .rpc('get_outlook_emails');
    
    if (fetchError) throw fetchError;
    
    return data || [];
  } catch (err: any) {
    console.error('Error fetching emails:', err);
    throw err;
  }
}

// List connected accounts
export async function listOutlookAccounts() {
  try {
    const { data, error } = await supabase.functions.invoke('microsoft-auth', {
      method: 'POST',
      body: { path: 'list-accounts' },
    });
    
    if (error) {
      console.error('Error listing accounts:', error);
      throw new Error(`Failed to list accounts: ${error.message || 'Unknown error'}`);
    }
    
    return data?.accounts || [];
  } catch (err: any) {
    console.error('Error listing accounts:', err);
    throw err;
  }
}

// Disconnect a specific account
export async function disconnectOutlookAccount(accountType: OutlookAccountType = 'personal') {
  try {
    // Log domain information for debugging
    console.log("Current domain during disconnect:", window.location.hostname);
    console.log("Is custom domain:", window.location.hostname.includes('afezcrm.com'));
    
    // Use the edge function instead of RPC
    const { data, error } = await supabase.functions.invoke('disconnect-outlook', {
      method: 'POST',
      body: { accountType }
    });
    
    if (error) {
      console.error('Error disconnecting account:', error);
      throw error;
    }
    
    return true;
  } catch (err: any) {
    console.error('Error disconnecting account:', err);
    throw err;
  }
}

// Initiate Microsoft OAuth flow
export async function initiateOutlookAuthorization(accountType: OutlookAccountType = 'personal', callbackUrl?: string) {
  try {
    // Get the absolute URL with origin for the callback
    const origin = window.location.origin;
    const defaultCallback = `${origin}/inbox`;
    
    // Log domain information for debugging
    console.log(`Starting Microsoft OAuth flow for ${accountType} account...`);
    console.log("Current domain during authorization:", window.location.hostname);
    console.log("Using origin:", origin);
    console.log("Default callback URL:", defaultCallback);
    console.log("Custom callback URL (if provided):", callbackUrl);
    
    // Add more diagnostic info to help troubleshoot
    console.log("Document URL:", document.URL);
    console.log("Window location:", window.location.toString());
    console.log("Protocol:", window.location.protocol);
    
    // Call the authorization endpoint to get the OAuth URL
    const authResponse = await supabase.functions.invoke('microsoft-auth', {
      method: 'POST',
      body: { 
        path: 'authorize',
        callbackUrl: callbackUrl || defaultCallback,
        accountType
      },
    });
    
    console.log('Authorization response:', authResponse);
    
    if (authResponse.error) {
      console.error('Error from edge function:', authResponse.error);
      
      // Special handling for unauthorized_client which indicates personal accounts not enabled
      if (authResponse.error.message?.includes('unauthorized_client')) {
        throw new Error(`Microsoft OAuth Error: The application is not configured to allow personal Microsoft accounts. 
        When registering your application in Azure, select "Accounts in any organizational directory and personal Microsoft accounts".`);
      }
      
      throw new Error(`Authorization failed: ${authResponse.error.message || 'Unknown error'}`);
    }
    
    const data = authResponse.data;
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.url) {
      console.log('Redirecting to OAuth URL:', data.url);
      // Return the URL or additional info from the edge function
      if (data.isHttps !== undefined || data.redirectUri) {
        return data;
      }
      return data.url;
    } else {
      throw new Error('No authorization URL returned');
    }
  } catch (err: any) {
    console.error('Error authorizing with Outlook:', err);
    throw err;
  }
}
