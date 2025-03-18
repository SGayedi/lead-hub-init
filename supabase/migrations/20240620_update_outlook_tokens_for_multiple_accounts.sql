
-- Modify outlook_tokens table to support multiple accounts per user
ALTER TABLE public.outlook_tokens 
  -- Make user_id not be a primary key anymore, since users can have multiple accounts
  DROP CONSTRAINT IF EXISTS outlook_tokens_pkey;

-- Add a new column for account type
ALTER TABLE public.outlook_tokens 
  ADD COLUMN account_type TEXT NOT NULL DEFAULT 'personal' CHECK (account_type IN ('personal', 'organizational'));

-- Create a composite primary key with user_id and account_type
ALTER TABLE public.outlook_tokens 
  ADD PRIMARY KEY (user_id, account_type);

-- Let's create a view that combines emails from all accounts
CREATE OR REPLACE FUNCTION public.get_outlook_emails()
 RETURNS SETOF outlook_emails
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT * FROM public.outlook_emails ORDER BY received_at DESC;
$function$;

-- Update the check_outlook_connection function to account for multiple accounts
CREATE OR REPLACE FUNCTION public.check_outlook_connection(account_type_param text DEFAULT 'personal')
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  token_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.outlook_tokens 
    WHERE user_id = auth.uid() AND account_type = account_type_param
  ) INTO token_exists;
  
  RETURN token_exists;
END;
$function$;

-- Update the disconnect_outlook function to handle account types
CREATE OR REPLACE FUNCTION public.disconnect_outlook(account_type_param text DEFAULT 'personal')
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.outlook_tokens
  WHERE user_id = auth.uid() AND account_type = account_type_param;
END;
$function$;
