
-- Function to check if the current user has connected Outlook
CREATE OR REPLACE FUNCTION public.check_outlook_connection()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  token_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.outlook_tokens 
    WHERE user_id = auth.uid()
  ) INTO token_exists;
  
  RETURN token_exists;
END;
$function$;

-- Function to disconnect Outlook
CREATE OR REPLACE FUNCTION public.disconnect_outlook()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM public.outlook_tokens
  WHERE user_id = auth.uid();
END;
$function$;

-- Grant execute permission on the functions to authenticated users
GRANT EXECUTE ON FUNCTION public.check_outlook_connection() TO authenticated;
GRANT EXECUTE ON FUNCTION public.disconnect_outlook() TO authenticated;
