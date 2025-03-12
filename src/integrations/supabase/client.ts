
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gfsawddappbypvndmzwc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc2F3ZGRhcHBieXB2bmRtendjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODM5MDMsImV4cCI6MjA1NzM1OTkwM30.pLKZsgVNw0nXpAQwaiVAF0tKgff80LTjIrxY3mgAGV8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
  }
});

// Add type declarations for our RPC functions
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: 'get_gmail_emails' | 'mark_email_as_enquiry' | 'connect_email_to_lead',
      params?: Record<string, unknown>
    ): Promise<{ data: T; error: null } | { data: null; error: Error }>;
  }
}
