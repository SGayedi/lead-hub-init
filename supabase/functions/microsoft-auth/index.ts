
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Get environment variables with validation
const MS_CLIENT_ID = Deno.env.get("MS_CLIENT_ID");
const MS_CLIENT_SECRET = Deno.env.get("MS_CLIENT_SECRET");
let REDIRECT_URI = Deno.env.get("REDIRECT_URI") || "";

// Set a default fallback redirect URI based on the request URL if not provided
const getRedirectUri = (req, callbackUrl) => {
  if (callbackUrl) return callbackUrl;
  if (REDIRECT_URI) return REDIRECT_URI;
  
  try {
    // Try to extract the origin from the request
    const url = new URL(req.url);
    return `${url.origin}/inbox`;
  } catch (e) {
    console.error("Could not extract origin from request URL:", e);
    return "http://localhost:3000/inbox"; // Fallback
  }
};

// Debug logging for environment variables
console.log("Edge function environment debugging:");
console.log(`MS_CLIENT_ID present: ${!!MS_CLIENT_ID} ${MS_CLIENT_ID ? `(${MS_CLIENT_ID.substring(0, 5)}...)` : ""}`);
console.log(`MS_CLIENT_SECRET present: ${!!MS_CLIENT_SECRET} ${MS_CLIENT_SECRET ? "(secret)" : ""}`);
console.log(`REDIRECT_URI present: ${!!REDIRECT_URI} ${REDIRECT_URI ? `(${REDIRECT_URI})` : ""}`);
console.log(`SUPABASE_URL present: ${!!SUPABASE_URL}`);
console.log(`SUPABASE_ANON_KEY present: ${!!SUPABASE_ANON_KEY}`);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  console.log(`Handling request for: ${req.url}`);

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const body = await req.json();
    const { path, callbackUrl } = body;
    
    console.log(`Processing path: ${path}`);
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

    switch (path) {
      case 'authorize': {
        console.log('Handling authorize request');
        try {
          // Generate Microsoft OAuth URL
          const scope = encodeURIComponent('offline_access Mail.Read');
          
          // Get the appropriate redirect URI, preferring the one provided in the request
          const redirectUri = getRedirectUri(req, callbackUrl);
          console.log('Using redirect URI:', redirectUri);
          
          // Ensure the redirect URI is properly encoded
          const encodedRedirectUri = encodeURIComponent(redirectUri);
          
          const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MS_CLIENT_ID}&response_type=code&redirect_uri=${encodedRedirectUri}&response_mode=query&scope=${scope}&state=${user.id}`;
          
          console.log('Generated auth URL:', authUrl);
          
          return new Response(
            JSON.stringify({ url: authUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error generating authorize URL:', error);
          return new Response(
            JSON.stringify({ error: `Error generating authorize URL: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      case 'callback': {
        console.log('Handling callback request');
        const { code, state } = body;
        
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'No code provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for token
        const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        
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
            JSON.stringify({ error: 'Failed to exchange code for token', details: tokenData }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Store tokens in a secure table
        const { error: insertError } = await supabase
          .from('outlook_tokens')
          .upsert({
            user_id: user.id,
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
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync-emails': {
        console.log('Handling sync-emails request');
        // Get Microsoft token
        const { data: tokenData, error: tokenError } = await supabase
          .from('outlook_tokens')
          .select('access_token, refresh_token, expires_at')
          .eq('user_id', user.id)
          .single();

        if (tokenError || !tokenData) {
          return new Response(
            JSON.stringify({ error: 'No Microsoft token found', details: tokenError }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if token needs refresh
        if (new Date(tokenData.expires_at) < new Date()) {
          // Refresh token
          const refreshResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
            .eq('user_id', user.id);

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
          JSON.stringify({ success: true, count: emails.length }),
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
  } catch (error) {
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
