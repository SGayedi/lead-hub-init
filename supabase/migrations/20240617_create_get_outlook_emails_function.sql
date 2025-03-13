
-- Create a function to safely get outlook emails
CREATE OR REPLACE FUNCTION public.get_outlook_emails()
 RETURNS SETOF outlook_emails
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT * FROM public.outlook_emails ORDER BY received_at DESC;
$function$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_outlook_emails() TO authenticated;
