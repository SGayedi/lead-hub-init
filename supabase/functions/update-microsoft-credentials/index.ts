
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Get the authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user profile to check if admin
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      return new Response(
        JSON.stringify({ error: 'Error retrieving user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Only allow senior management to update credentials
    if (userProfile.role !== 'senior_management') {
      return new Response(
        JSON.stringify({ error: 'Permission denied. Only senior management can update credentials.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const { clientId, clientSecret, redirectUri } = await req.json();
    
    if (!clientId || !clientSecret || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Missing required credentials' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update the secrets in Supabase
    const updateClientId = await supabaseAdmin.functions.setSecret('MS_CLIENT_ID', clientId);
    const updateClientSecret = await supabaseAdmin.functions.setSecret('MS_CLIENT_SECRET', clientSecret);
    const updateRedirectUri = await supabaseAdmin.functions.setSecret('REDIRECT_URI', redirectUri);
    
    // Log the action in the audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'update_microsoft_credentials',
        entity_type: 'system_settings',
        performed_by: user.id,
        is_admin: true,
        user_agent: req.headers.get('user-agent') || '',
        changes: { 
          ms_client_id_updated: true,
          ms_client_secret_updated: true,
          redirect_uri_updated: true
        }
      });
    
    return new Response(
      JSON.stringify({ 
        message: 'Microsoft credentials updated successfully',
        ms_client_id_updated: true,
        ms_client_secret_updated: true,
        redirect_uri_updated: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in update-microsoft-credentials function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
