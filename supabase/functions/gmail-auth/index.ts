import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Get environment variables from config.toml
const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID");
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET");
let REDIRECT_URI = Deno.env.get("REDIRECT_URI") || "";

// Log environment variables for debugging
console.log("Environment variables loaded:");
console.log("GMAIL_CLIENT_ID:", GMAIL_CLIENT_ID);
console.log("GMAIL_CLIENT_SECRET present:", !!GMAIL_CLIENT_SECRET);
console.log("REDIRECT_URI:", REDIRECT_URI);

// Validate required environment variables
if (!GMAIL_CLIENT_ID) {
  console.error("Missing GMAIL_CLIENT_ID environment variable");
}
if (!GMAIL_CLIENT_SECRET) {
  console.error("Missing GMAIL_CLIENT_SECRET environment variable");
}

// Validate redirect URI - it must be a valid absolute URL
try {
  // Test if it can be parsed as a URL
  new URL(REDIRECT_URI);
} catch (e) {
  console.error("Invalid REDIRECT_URI:", REDIRECT_URI, "Error:", e.message);
  // Set a fallback for local development
  REDIRECT_URI = "http://localhost:5173/settings";
}

console.log("Using REDIRECT_URI:", REDIRECT_URI);
console.log("Using GMAIL_CLIENT_ID:", GMAIL_CLIENT_ID ? "Present" : "Missing");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const body = await req.json();
    const { path } = body;

    // Special endpoint for checking setup status that doesn't require authentication
    if (path === 'check-setup') {
      const isConfigured = !!(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && REDIRECT_URI);
      return new Response(
        JSON.stringify({ 
          status: isConfigured ? 'complete' : 'incomplete',
          details: {
            client_id: !!GMAIL_CLIENT_ID,
            client_secret: !!GMAIL_CLIENT_SECRET,
            redirect_uri: !!REDIRECT_URI
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All other endpoints require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required environment variables
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
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
        const { code, state } = body;
        
        if (!code) {
          return new Response(
            JSON.stringify({ error: 'No code provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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
          return new Response(
            JSON.stringify({ error: 'No Gmail token found', details: tokenError }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if token needs refresh
        if (new Date(tokenData.expires_at) < new Date()) {
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
            return new Response(
              JSON.stringify({ error: 'Failed to refresh token', details: refreshData }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

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

        // Fetch emails from Gmail API
        const emailsResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in:inbox', {
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
        const messageIds = emailsData.messages || [];
        
        // Fetch detailed email data for each message
        const emails = [];
        for (const message of messageIds.slice(0, 10)) { // Limit to first 10 for performance
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
        
        // Create a table for Gmail emails if it doesn't exist (this would normally be done via a separate migration)
        const { error: tableError } = await supabase.rpc('create_gmail_emails_if_not_exists');
        if (tableError) {
          console.error('Error ensuring table exists:', tableError);
        }
        
        // Store emails in the database
        for (const email of emails) {
          // Check if email already exists
          const { data: existingEmail } = await supabase
            .from('gmail_emails')
            .select('id')
            .eq('id', email.id)
            .maybeSingle();
            
          if (!existingEmail) {
            // Insert new email
            await supabase
              .from('gmail_emails')
              .insert(email);
          }
        }

        return new Response(
          JSON.stringify({ success: true, count: emails.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid path' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

