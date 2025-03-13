
-- Create the table for storing Outlook emails if it doesn't exist
CREATE TABLE IF NOT EXISTS public.outlook_emails (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  has_attachments BOOLEAN NOT NULL DEFAULT FALSE,
  is_enquiry BOOLEAN NOT NULL DEFAULT FALSE,
  associated_lead_id UUID REFERENCES public.leads(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to the table
ALTER TABLE public.outlook_emails ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all authenticated users to view all emails
CREATE POLICY "Users can view all emails" 
  ON public.outlook_emails 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy that allows all authenticated users to create emails
CREATE POLICY "Users can create emails" 
  ON public.outlook_emails 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy that allows all authenticated users to update emails
CREATE POLICY "Users can update emails" 
  ON public.outlook_emails 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER set_outlook_emails_updated_at
BEFORE UPDATE ON public.outlook_emails
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Create table for storing Outlook tokens
CREATE TABLE IF NOT EXISTS public.outlook_tokens (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS to the tokens table
ALTER TABLE public.outlook_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own tokens
CREATE POLICY "Users can view their own tokens" 
  ON public.outlook_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own tokens
CREATE POLICY "Users can insert their own tokens" 
  ON public.outlook_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own tokens
CREATE POLICY "Users can update their own tokens" 
  ON public.outlook_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER set_outlook_tokens_updated_at
BEFORE UPDATE ON public.outlook_tokens
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
