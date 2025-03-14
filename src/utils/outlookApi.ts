
import { supabase } from '@/integrations/supabase/client';

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
export async function syncOutlookEmails() {
  try {
    const { data, error } = await supabase.functions.invoke('microsoft-auth', {
      method: 'POST',
      body: { path: 'sync-emails' },
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

// Initiate Microsoft OAuth flow
export async function initiateOutlookAuthorization(callbackUrl?: string) {
  try {
    console.log('Starting Microsoft OAuth flow...');
    
    // Call the authorization endpoint to get the OAuth URL
    const authResponse = await supabase.functions.invoke('microsoft-auth', {
      method: 'POST',
      body: { 
        path: 'authorize',
        callbackUrl
      },
    });
    
    console.log('Authorization response:', authResponse);
    
    if (authResponse.error) {
      console.error('Error from edge function:', authResponse.error);
      throw new Error(`Authorization failed: ${authResponse.error.message || 'Unknown error'}`);
    }
    
    const data = authResponse.data;
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    if (data.url) {
      console.log('Redirecting to OAuth URL:', data.url);
      return data.url;
    } else {
      throw new Error('No authorization URL returned');
    }
  } catch (err: any) {
    console.error('Error authorizing with Outlook:', err);
    throw err;
  }
}
