-- Allow public access to read active chatbot settings
CREATE POLICY "Public users can read active settings" 
ON public.chatbot_settings 
FOR SELECT 
USING (is_active = true);

-- Drop the old authenticated-only policy since the new one supersedes it
DROP POLICY IF EXISTS "Authenticated users can read active settings" ON public.chatbot_settings;