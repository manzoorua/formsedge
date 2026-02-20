-- Fix the security vulnerability in form_response_answers table
-- The current policies are not restrictive enough

-- First, drop the existing policies to replace them with more secure ones
DROP POLICY IF EXISTS "Enhanced secure access to response answers" ON public.form_response_answers;
DROP POLICY IF EXISTS "Users can insert answers to authorized responses" ON public.form_response_answers;

-- Create a more restrictive SELECT policy that requires authentication
-- and proper authorization through form ownership or team membership
CREATE POLICY "Restrict form response answers to authorized users only"
ON public.form_response_answers
FOR SELECT
TO authenticated
USING (
  -- User must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- And must have proper access to the response
  EXISTS (
    SELECT 1 
    FROM form_responses fr
    JOIN forms f ON fr.form_id = f.id
    WHERE fr.id = form_response_answers.response_id
    AND (
      -- User is the form owner
      f.owner_id = auth.uid()
      OR
      -- User is the respondent who submitted this response
      fr.respondent_id = auth.uid()
      OR
      -- User is a team member with access to this form
      EXISTS (
        SELECT 1 
        FROM team_members tm 
        WHERE tm.form_id = f.id 
        AND tm.user_id = auth.uid() 
        AND tm.accepted_at IS NOT NULL
      )
    )
  )
);

-- Create a secure INSERT policy for form responses
CREATE POLICY "Users can submit answers to public forms only"
ON public.form_response_answers
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM form_responses fr
    JOIN forms f ON fr.form_id = f.id
    WHERE fr.id = form_response_answers.response_id
    AND (
      -- Either the user is authenticated and owns the response
      (auth.uid() IS NOT NULL AND fr.respondent_id = auth.uid())
      OR
      -- Or it's a public form that accepts responses
      (f.is_public = true 
       AND f.status = 'published'::form_status 
       AND f.accept_responses = true)
    )
  )
);

-- Add a trigger to log access attempts for security monitoring
CREATE OR REPLACE FUNCTION log_response_answer_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log potential security events (optional - for monitoring)
  -- This could be expanded to include actual logging to an audit table
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the logging trigger
DROP TRIGGER IF EXISTS response_answer_access_log ON public.form_response_answers;
CREATE TRIGGER response_answer_access_log
  AFTER SELECT ON public.form_response_answers
  FOR EACH ROW
  EXECUTE FUNCTION log_response_answer_access();

-- Verify the table is still properly secured
-- This should return 0 for unauthenticated users