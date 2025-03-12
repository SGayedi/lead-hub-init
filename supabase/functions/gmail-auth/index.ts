
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Read environment variables from config.toml
const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET");
let REDIRECT_URI = Deno.env.get("REDIRECT_URI") || "";

// Enhanced logging for better debugging
console.log("=== Gmail Auth Edge Function Initialization ===");
console.log(`GMAIL_CLIENT_ID: ${GMAIL_CLIENT_ID ? "Configured" : "MISSING"}`);
console.log(`GMAIL_CLIENT_SECRET: ${GMAIL_CLIENT_SECRET ? "Configured" : "MISSING"}`);
console.log(`REDIRECT_URI: ${REDIRECT_URI}`);
console.log(`SUPABASE_URL: ${SUPABASE_URL ? "Configured" : "MISSING"}`);
console.log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? "Configured" : "MISSING"}`);

// Verify required environment variables
const missingVars = [];
if (!GMAIL_CLIENT_ID) missingVars.push("GMAIL_CLIENT_ID");
if (!GMAIL_CLIENT_SECRET) missingVars.push("GMAIL_CLIENT_SECRET");
if (!REDIRECT_URI) missingVars.push("REDIRECT_URI");
if (!SUPABASE_URL) missingVars.push("SUPABASE_URL");
if (!SUPABASE_ANON_KEY) missingVars.push("SUPABASE_ANON_KEY");

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

// Validate redirect URI - it must be a valid absolute URL
try {
  // Test if it can be parsed as a URL
  new URL(REDIRECT_URI);
  console.log("REDIRECT_URI is valid");
} catch (e) {
  console.error("Invalid REDIRECT_URI:", REDIRECT_URI, "Error:", e.message);
  // Set a fallback for local development
  REDIRECT_URI = "http://localhost:5173/settings";
  console.log("Using fallback REDIRECT_URI:", REDIRECT_URI);
}

serve(async (req) => {
  console.log(`Request received: ${req.method} ${new URL(req.url).pathname}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  // Special check to directly log environment variables on request
  if (new URL(req.url).pathname.includes('/debug-env')) {
    console.log("Debug environment request received");
    return new Response(
      JSON.stringify({
        message: "Environment variable check",
        clientId: GMAIL_CLIENT_ID ? "Present" : "Missing",
        clientSecret: GMAIL_CLIENT_SECRET ? "Present" : "Missing",
        redirectUri: REDIRECT_URI,
        supabaseUrl: SUPABASE_URL ? "Present" : "Missing",
        supabaseKey: SUPABASE_ANON_KEY ? "Present" : "Missing"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase client initialized");

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body parsed:", JSON.stringify(body));
    } catch (e) {
      console.error("Error parsing request body:", e.message);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { path } = body;
    console.log(`Handling request for path: ${path}`);

    // Special endpoint for checking setup status that doesn't require authentication
    if (path === 'check-setup') {
      console.log("Checking setup status");
      const clientIdStatus = !!GMAIL_CLIENT_ID;
      const clientSecretStatus = !!GMAIL_CLIENT_SECRET;
      const redirectUriStatus = !!REDIRECT_URI;
      const isConfigured = clientIdStatus && clientSecretStatus && redirectUriStatus;
      
      console.log(`Setup status: ${isConfigured ? 'complete' : 'incomplete'}`);
      console.log(`Client ID: ${clientIdStatus ? 'Found' : 'Missing'}`);
      console.log(`Client Secret: ${clientSecretStatus ? 'Found' : 'Missing'}`);
      console.log(`Redirect URI: ${redirectUriStatus ? 'Found' : 'Missing'}`);
      
      return new Response(
        JSON.stringify({ 
          status: isConfigured ? 'complete' : 'incomplete',
          details: {
            client_id: clientIdStatus,
            client_secret: clientSecretStatus,
            redirect_uri: redirectUriStatus
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All other endpoints require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid auth token:", userError);
      return new Response(
        JSON.stringify({ error: 'Invalid auth token', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Authenticated user: ${user.id}`);

    // Validate required environment variables
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
      console.error("Gmail OAuth configuration is incomplete");
      console.error(`GMAIL_CLIENT_ID: ${GMAIL_CLIENT_ID || "MISSING"}`);
      console.error(`GMAIL_CLIENT_SECRET: ${GMAIL_CLIENT_SECRET || "MISSING"}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Gmail OAuth configuration is incomplete', 
          details: 'Missing client ID or secret' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle different paths
    switch (path) {
      case 'authorize': {
        console.log('Handling authorize request');
        // Generate Gmail OAuth URL
        const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly');
        
        // Ensure the redirect URI is properly encoded
        const encodedRedirectUri = encodeURIComponent(REDIRECT_URI);
        console.log('Encoded redirect URI:', encodedRedirectUri);
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GMAIL_CLIENT_ID}&response_type=code&redirect_uri=${encodedRedirectUri}&scope=${scope}&access_type=offline&prompt=consent&state=${user.id}`;
        
        console.log('Generated auth URL:', authUrl);
        
        return new Response(
          JSON.stringify({ url: authUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'callback': {
        console.log('Handling callback request');
        const { code } = body;
        
        if (!code) {
          console.error('No code provided in callback');
          return new Response(
            JSON.stringify({ error: 'No code provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('OAuth code received, exchanging for token');
        // Exchange code for token
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        console.log('Requesting token with redirect URI:', REDIRECT_URI);
        
        const formData = new URLSearchParams({
          client_id: GMAIL_CLIENT_ID,
          client_secret: GMAIL_CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        });

        console.log('Token request parameters prepared');
        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        console.log(`Token response status: ${tokenResponse.status}`);
        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
          console.error('Token exchange error:', tokenData);
          return new Response(
            JSON.stringify({ error: 'Failed to exchange code for token', details: tokenData }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Token received successfully, storing in database');
        
        // Store tokens in a secure table
        const { error: insertError } = await supabase
          .from('gmail_tokens')
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

        console.log('Token stored successfully');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync-emails': {
        console.log('Handling sync-emails request');
        // Get Gmail token
        const { data: tokenData, error: tokenError } = await supabase
          .from('gmail_tokens')
          .select('access_token, refresh_token, expires_at')
          .eq('user_id', user.id)
          .single();

        if (tokenError || !tokenData) {
          console.error('No Gmail token found:', tokenError);
          return new Response(
            JSON.stringify({ error: 'No Gmail token found', details: tokenError }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if token needs refresh
        if (new Date(tokenData.expires_at) < new Date()) {
          console.log('Token expired, refreshing');
          // Refresh token
          const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: GMAIL_CLIENT_ID,
              client_secret: GMAIL_CLIENT_SECRET,
              refresh_token: tokenData.refresh_token,
              grant_type: 'refresh_token',
            }),
          });

          const refreshData = await refreshResponse.json();
          
          if (!refreshResponse.ok) {
            console.error('Failed to refresh token:', refreshData);
            return new Response(
              JSON.stringify({ error: 'Failed to refresh token', details: refreshData }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('Token refreshed successfully');
          
          // Update token in database
          await supabase
            .from('gmail_tokens')
            .update({
              access_token: refreshData.access_token,
              expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            })
            .eq('user_id', user.id);

          tokenData.access_token = refreshData.access_token;
        }

        console.log('Fetching emails from Gmail API');
        
        // Fetch emails from Gmail API
        const emailsResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in:inbox', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!emailsResponse.ok) {
          const errorData = await emailsResponse.json();
          console.error('Failed to fetch emails:', errorData);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch emails', details: errorData }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const emailsData = await emailsResponse.json();
        const messageIds = emailsData.messages || [];
        console.log(`Found ${messageIds.length} emails`);
        
        // Fetch detailed email data for each message
        const emails = [];
        for (const message of messageIds.slice(0, 10)) { // Limit to first 10 for performance
          console.log(`Fetching details for email ${message.id}`);
          const messageResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`, {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          });
          
          if (messageResponse.ok) {
            const messageData = await messageResponse.json();
            
            // Process email data
            const headers = messageData.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
            const from = headers.find(h => h.name === 'From')?.value || '';
            
            // Parse the From field
            let senderName = from;
            let senderEmail = '';
            
            const emailMatch = from.match(/<([^>]+)>/);
            if (emailMatch) {
              senderEmail = emailMatch[1];
              senderName = from.split('<')[0].trim();
              if (senderName.endsWith('"') && senderName.startsWith('"')) {
                senderName = senderName.slice(1, -1);
              }
            } else if (from.includes('@')) {
              senderEmail = from;
              senderName = from.split('@')[0];
            }
            
            // Get email body
            let body = '';
            if (messageData.payload.parts && messageData.payload.parts.length) {
              const textPart = messageData.payload.parts.find(part => 
                part.mimeType === 'text/plain' || part.mimeType === 'text/html'
              );
              
              if (textPart && textPart.body && textPart.body.data) {
                // Convert from base64url to text
                body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                
                // If HTML, try to extract just the text
                if (textPart.mimeType === 'text/html') {
                  body = body.replace(/<[^>]*>/g, ' ');
                }
                
                // Trim to a reasonable preview length
                body = body.substring(0, 500);
              }
            } else if (messageData.payload.body && messageData.payload.body.data) {
              body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              body = body.substring(0, 500);
            }
            
            const email = {
              id: messageData.id,
              subject,
              sender_name: senderName,
              sender_email: senderEmail,
              received_at: new Date(parseInt(messageData.internalDate)).toISOString(),
              body,
              read: !messageData.labelIds.includes('UNREAD'),
              has_attachments: !!messageData.payload.parts?.some(part => part.filename && part.filename.length > 0),
              is_enquiry: false, // Default value
            };
            
            emails.push(email);
          }
        }
        
        console.log(`Processed ${emails.length} emails, ensuring database table exists`);
        
        // Create a table for Gmail emails if it doesn't exist
        const { error: tableError } = await supabase.rpc('create_gmail_emails_if_not_exists');
        if (tableError) {
          console.error('Error ensuring table exists:', tableError);
        }
        
        console.log('Table existence verified, storing emails');
        
        // Store emails in the database
        let insertCount = 0;
        for (const email of emails) {
          // Check if email already exists
          const { data: existingEmail } = await supabase
            .from('gmail_emails')
            .select('id')
            .eq('id', email.id)
            .maybeSingle();
            
          if (!existingEmail) {
            // Insert new email
            const { error: insertError } = await supabase
              .from('gmail_emails')
              .insert(email);
              
            if (insertError) {
              console.error(`Error inserting email ${email.id}:`, insertError);
            } else {
              insertCount++;
            }
          }
        }

        console.log(`Successfully stored ${insertCount} new emails`);
        return new Response(
          JSON.stringify({ success: true, count: insertCount }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        console.error(`Invalid path: ${path}`);
        return new Response(
          JSON.stringify({ error: 'Invalid path' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Unhandled error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
