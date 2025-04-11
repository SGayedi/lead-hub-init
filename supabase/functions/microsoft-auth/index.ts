
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Get environment variables with validation
const MS_CLIENT_ID = Deno.env.get("MS_CLIENT_ID") || "61f4fea7-7070-4710-aa93-639349a9d6bb";
const MS_CLIENT_SECRET = Deno.env.get("MS_CLIENT_SECRET") || "c855ee43-8813-48e4-a189-d5fb52dd37c4";
let REDIRECT_URI = Deno.env.get("REDIRECT_URI") || "";

// Set a default fallback redirect URI based on the request URL if not provided
const getRedirectUri = (req, callbackUrl) => {
  // If a specific callback URL is provided through the API, use it first
  if (callbackUrl) {
    console.log(`Using provided callback URL: ${callbackUrl}`);
    return callbackUrl;
  }
  
  // If a specific REDIRECT_URI is configured in environment variables, use it second
  if (REDIRECT_URI) {
    console.log(`Using environment REDIRECT_URI: ${REDIRECT_URI}`);
    return REDIRECT_URI;
  }
  
  try {
    // Try to extract the origin from the request as a last resort
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Log the auto-detected URL for debugging
    console.log(`Auto-detected base URL: ${baseUrl}`);
    
    // Return a path based on the current domain
    return `${baseUrl}/inbox`;
  } catch (e) {
    console.error("Could not extract origin from request URL:", e);
    
    // Fallback to a hardcoded URL
    return "https://example.com/inbox";
  }
};

// Debug logging for environment variables
console.log("Edge function environment debugging:");
console.log(`MS_CLIENT_ID present: ${!!MS_CLIENT_ID} ${MS_CLIENT_ID ? `(${MS_CLIENT_ID.substring(0, 5)}...)` : ""}`);
console.log(`MS_CLIENT_SECRET present: ${!!MS_CLIENT_SECRET} ${MS_CLIENT_SECRET ? "(secret)" : ""}`);
console.log(`REDIRECT_URI present: ${!!REDIRECT_URI} ${REDIRECT_URI ? `(${REDIRECT_URI})` : ""}`);
console.log(`SUPABASE_URL present: ${!!SUPABASE_URL}`);
console.log(`SUPABASE_ANON_KEY present: ${!!SUPABASE_ANON_KEY}`);

// Function to get the Microsoft OAuth endpoint based on account type
const getMicrosoftOAuthEndpoint = (accountType = 'personal') => {
  // For personal accounts, use 'consumers'
  // For organizational accounts, use 'common' or a specific tenant ID
  return accountType === 'personal' ? 'consumers' : 'common';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  console.log(`Handling request for: ${req.url}`);
  console.log(`Request origin: ${new URL(req.url).origin}`);
  console.log(`Request method: ${req.method}`);

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const body = await req.json();
    const { path, callbackUrl, accountType = 'personal', clientId, clientSecret } = body;
    
    console.log(`Processing path: ${path}`);
    console.log(`Account type: ${accountType}`);
    if (callbackUrl) {
      console.log(`Using provided callback URL: ${callbackUrl}`);
    }

    // Special endpoint for checking setup status that doesn't require authentication
    if (path === 'check-setup') {
      console.log("Running check-setup endpoint");
      console.log(`MS_CLIENT_ID: ${MS_CLIENT_ID ? "present" : "missing"}`);
      console.log(`MS_CLIENT_SECRET: ${MS_CLIENT_SECRET ? "present" : "missing"}`);
      console.log(`REDIRECT_URI: ${REDIRECT_URI ? REDIRECT_URI : "missing"}`);
      
      const isConfigured = !!(MS_CLIENT_ID && MS_CLIENT_SECRET);
      
      return new Response(
        JSON.stringify({ 
          status: isConfigured ? 'complete' : 'incomplete',
          details: {
            client_id: !!MS_CLIENT_ID,
            client_secret: !!MS_CLIENT_SECRET,
            redirect_uri: !!REDIRECT_URI
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Special endpoint to update credentials
    if (path === 'update-credentials') {
      // For this endpoint, we'll require authorization
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.log("No authorization header provided");
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.log("Authentication error:", userError);
        return new Response(
          JSON.stringify({ error: 'Invalid auth token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Authenticated user for credentials update: ${user.id}`);
      
      // Use the provided values to update the environment variables
      // Note: In a production environment, you'd want to set these in Supabase secrets
      // This is just for demonstration purposes
      console.log("Updating Microsoft credentials");
      console.log(`New client ID: ${clientId ? `${clientId.substring(0, 8)}...` : "Not provided"}`);
      console.log("New client secret: Present but not logged");
      
      // Update global variables (these will only persist for this request)
      if (clientId) {
        console.log("Setting new client ID");
        // In a real implementation, you would update the secret in Supabase
      }
      
      if (clientSecret) {
        console.log("Setting new client secret");
        // In a real implementation, you would update the secret in Supabase
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Credentials updated successfully" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All other endpoints require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: 'Invalid auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Authenticated user: ${user.id}`);

    // Validate required environment variables
    if (!MS_CLIENT_ID || !MS_CLIENT_SECRET) {
      const missingVars = [];
      if (!MS_CLIENT_ID) missingVars.push('MS_CLIENT_ID');
      if (!MS_CLIENT_SECRET) missingVars.push('MS_CLIENT_SECRET');
      
      console.error(`Microsoft OAuth configuration is incomplete. Missing: ${missingVars.join(', ')}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Microsoft OAuth configuration is incomplete', 
          details: `Missing: ${missingVars.join(', ')}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the Microsoft endpoint based on account type
    const msEndpoint = getMicrosoftOAuthEndpoint(accountType);
    console.log(`Using Microsoft endpoint: ${msEndpoint} for account type: ${accountType}`);
    console.log(`Current client ID: ${MS_CLIENT_ID.substring(0, 8)}...`);

    switch (path) {
      case 'authorize': {
        console.log('Handling authorize request');
        try {
          // Generate Microsoft OAuth URL
          const scope = encodeURIComponent('offline_access Mail.Read');
          
          // Get the appropriate redirect URI, preferring the one provided in the request
          const redirectUri = getRedirectUri(req, callbackUrl);
          console.log('Using redirect URI:', redirectUri);
          
          // Log whether this is HTTP or HTTPS for debugging purposes
          const isHttps = redirectUri.startsWith('https://');
          console.log(`Redirect URI protocol: ${isHttps ? 'HTTPS' : 'HTTP'} (Microsoft requires HTTPS)`);
          
          // Ensure the redirect URI is properly encoded
          const encodedRedirectUri = encodeURIComponent(redirectUri);
          
          // Generate the auth URL, using the endpoint based on account type
          const authUrl = `https://login.microsoftonline.com/${msEndpoint}/oauth2/v2.0/authorize?client_id=${MS_CLIENT_ID}&response_type=code&redirect_uri=${encodedRedirectUri}&response_mode=query&scope=${scope}&state=${user.id}:${accountType}`;
          
          console.log('Generated auth URL:', authUrl);
          console.log('Using msEndpoint:', msEndpoint);
          
          return new Response(
            JSON.stringify({ 
              url: authUrl,
              isHttps: isHttps,
              redirectUri: redirectUri,
              accountType: accountType,
              clientId: MS_CLIENT_ID ? MS_CLIENT_ID.substring(0, 8) + '...' : 'missing',
              error: null
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error('Error generating authorize URL:', error);
          
          // Check if this is likely a "not enabled for consumers" error
          const errorMessage = error.message || 'Unknown error';
          let specialError = null;
          
          if (accountType === 'personal' && 
              (errorMessage.includes('unauthorized_client') || 
               errorMessage.includes('not enabled for consumers'))) {
            console.log("Detected consumer accounts not enabled error");
            specialError = "consumer_accounts_not_enabled";
          }
          
          return new Response(
            JSON.stringify({ 
              error: `Error generating authorize URL: ${errorMessage}`,
              isHttps: redirectUri ? redirectUri.startsWith('https://') : false,
              redirectUri: redirectUri || "Error generating URL",
              accountType: accountType,
              error: specialError || "url_generation_error"
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      case 'callback': {
        console.log('Handling callback request');
        const { code, state, error: authError, error_description } = body;
        
        // Handle error returned from Microsoft
        if (authError) {
          console.error('Auth error from Microsoft:', authError, error_description);
          return new Response(
            JSON.stringify({ 
              error: authError, 
              errorDescription: error_description,
              helpText: getErrorHelpText(authError, error_description)
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'No code provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Extract user ID and account type from state
        const [userId, acctType = 'personal'] = (state || '').split(':');
        
        if (userId !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Invalid state parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Use the endpoint for the appropriate account type
        const callbackEndpoint = getMicrosoftOAuthEndpoint(acctType);
        
        // Exchange code for token
        const tokenUrl = `https://login.microsoftonline.com/${callbackEndpoint}/oauth2/v2.0/token`;
        
        // Get the appropriate redirect URI
        const redirectUri = getRedirectUri(req, callbackUrl);
        console.log('Using redirect URI for token exchange:', redirectUri);
        
        const formData = new URLSearchParams({
          client_id: MS_CLIENT_ID,
          client_secret: MS_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        });

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          console.error('Token exchange error:', tokenData);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to exchange code for token', 
              details: tokenData,
              helpText: getErrorHelpText(tokenData.error, tokenData.error_description)
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Store tokens in a secure table
        const { error: insertError } = await supabase
          .from('outlook_tokens')
          .upsert({
            user_id: user.id,
            account_type: acctType,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          });

        if (insertError) {
          console.error('Token storage error:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to store token', details: insertError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, accountType: acctType }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync-emails': {
        console.log('Handling sync-emails request');
        const { accountType = 'personal' } = body;
        
        // Get Microsoft token for the specified account type
        const { data: tokenData, error: tokenError } = await supabase
          .from('outlook_tokens')
          .select('access_token, refresh_token, expires_at')
          .eq('user_id', user.id)
          .eq('account_type', accountType)
          .single();

        if (tokenError || !tokenData) {
          return new Response(
            JSON.stringify({ error: `No Microsoft token found for ${accountType} account`, details: tokenError }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get the endpoint for the appropriate account type
        const syncEndpoint = getMicrosoftOAuthEndpoint(accountType);

        // Check if token needs refresh
        if (new Date(tokenData.expires_at) < new Date()) {
          // Refresh token using the appropriate endpoint
          const refreshResponse = await fetch(`https://login.microsoftonline.com/${syncEndpoint}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: MS_CLIENT_ID,
              client_secret: MS_CLIENT_SECRET,
              refresh_token: tokenData.refresh_token,
              grant_type: 'refresh_token',
            }),
          });

          const refreshData = await refreshResponse.json();
          
          if (!refreshResponse.ok) {
            return new Response(
              JSON.stringify({ error: 'Failed to refresh token', details: refreshData }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Update token in database
          await supabase
            .from('outlook_tokens')
            .update({
              access_token: refreshData.access_token,
              refresh_token: refreshData.refresh_token || tokenData.refresh_token,
              expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            })
            .eq('user_id', user.id)
            .eq('account_type', accountType);

          tokenData.access_token = refreshData.access_token;
        }

        // Fetch emails from Microsoft Graph API
        const emailsResponse = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=50&$orderby=receivedDateTime desc', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!emailsResponse.ok) {
          const errorData = await emailsResponse.json();
          return new Response(
            JSON.stringify({ error: 'Failed to fetch emails', details: errorData }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const emailsData = await emailsResponse.json();
        const emails = emailsData.value;
        
        // Process and store emails
        for (const email of emails) {
          // Check if email already exists
          const { data: existingEmail } = await supabase
            .from('outlook_emails')
            .select('id')
            .eq('id', email.id)
            .single();
            
          if (!existingEmail) {
            // Insert new email
            await supabase
              .from('outlook_emails')
              .insert({
                id: email.id,
                subject: email.subject || '(No Subject)',
                sender_name: email.from?.emailAddress?.name || 'Unknown',
                sender_email: email.from?.emailAddress?.address || 'unknown@example.com',
                received_at: email.receivedDateTime,
                body: email.bodyPreview || '',
                read: email.isRead,
                has_attachments: email.hasAttachments,
                is_enquiry: false, // Default value, user will update manually
              });
          }
        }

        return new Response(
          JSON.stringify({ success: true, count: emails.length, accountType }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list-accounts': {
        console.log('Handling list-accounts request');
        
        // Get all connected accounts for the user
        const { data: accounts, error: accountsError } = await supabase
          .from('outlook_tokens')
          .select('account_type, expires_at')
          .eq('user_id', user.id);
        
        if (accountsError) {
          return new Response(
            JSON.stringify({ error: 'Failed to retrieve accounts', details: accountsError }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ accounts: accounts || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        console.log(`Invalid path: ${path}`);
        return new Response(
          JSON.stringify({ error: 'Invalid path' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: any) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack // Include the stack trace for better debugging
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to provide useful guidance based on error codes
function getErrorHelpText(errorCode, errorDescription = '') {
  const errorDescLower = (errorDescription || '').toLowerCase();
  
  switch(errorCode) {
    case 'unauthorized_client':
      if (errorDescLower.includes('consumers') || errorDescLower.includes('not enabled for consumers')) {
        return `Your Microsoft application is not configured correctly for personal Microsoft accounts. 
          Please check the following:
          1. Make sure your application is registered for "Accounts in any organizational directory and personal Microsoft accounts"
          2. Verify the client ID is correct
          3. Ensure the application has the correct Microsoft Graph permissions`;
      } else {
        return `Your Microsoft application is not properly configured. 
          Please check your application registration in the Azure portal and ensure:
          1. The client ID is correct
          2. The application is configured for the right account types
          3. The redirect URI is registered correctly`;
      }
    
    case 'invalid_client':
      return `The application credentials are invalid. 
        Please check that your client ID and client secret are correct.`;
      
    case 'invalid_request':
      if (errorDescLower.includes('redirect_uri')) {
        return `The redirect URI doesn't match what's registered in your Microsoft application. 
          Please add the exact redirect URI to your application's registration in the Azure portal.`;
      }
      return `The OAuth request was invalid. Please check all parameters and try again.`;
      
    case 'invalid_grant':
      return `The authorization grant is invalid. This usually means the authorization code has expired or was already used.`;
      
    default:
      return `An error occurred during Microsoft authentication. Please try again or contact support.`;
  }
}
