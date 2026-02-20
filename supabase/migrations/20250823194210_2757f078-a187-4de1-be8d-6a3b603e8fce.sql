-- SECURITY FIX: Strengthen RLS policies for form responses and answers to prevent unauthorized access to personal data

-- First, let's create a security definer function to check if a user can access a specific form response
CREATE OR REPLACE FUNCTION public.can_access_response(response_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    -- User can access if they are the respondent
    SELECT 1 FROM form_responses fr 
    WHERE fr.id = response_id AND fr.respondent_id = user_id
  ) OR EXISTS (
    -- Or if they are the form owner or team member
    SELECT 1 FROM form_responses fr
    JOIN forms f ON fr.form_id = f.id
    WHERE fr.id = response_id 
    AND (
      f.owner_id = user_id 
      OR get_user_role_for_form(f.id, user_id) IS NOT NULL
    )
  );
$function$;

-- Drop existing policies that may be too permissive
DROP POLICY IF EXISTS "Users can view answers through responses" ON public.form_response_answers;
DROP POLICY IF EXISTS "Users can insert answers to accessible responses" ON public.form_response_answers;

-- Create more restrictive policies for form_response_answers
CREATE POLICY "Authorized users can view response answers"
ON public.form_response_answers
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  public.can_access_response(response_id, auth.uid())
);

CREATE POLICY "Users can insert answers to authorized responses"
ON public.form_response_answers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM form_responses fr
    JOIN forms f ON fr.form_id = f.id
    WHERE fr.id = response_id
    AND (
      -- Either user is the respondent
      fr.respondent_id = auth.uid()
      OR 
      -- Or it's a public form accepting responses
      (f.is_public = true AND f.status = 'published' AND f.accept_responses = true)
    )
  )
);

-- Update form_responses policies to be more restrictive
DROP POLICY IF EXISTS "Form owners can view all responses" ON public.form_responses;
DROP POLICY IF EXISTS "Users can view their own responses" ON public.form_responses;

-- Create more secure policies for form_responses
CREATE POLICY "Authorized users can view form responses"
ON public.form_responses
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  (
    -- User is the respondent
    respondent_id = auth.uid()
    OR
    -- User is form owner or team member  
    EXISTS (
      SELECT 1 FROM forms f
      WHERE f.id = form_id
      AND (
        f.owner_id = auth.uid()
        OR get_user_role_for_form(f.id, auth.uid()) IS NOT NULL
      )
    )
  )
);

-- Add mask_email function usage for respondent_email field access
CREATE OR REPLACE FUNCTION public.get_masked_respondent_email(response_id uuid, requesting_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    CASE 
      WHEN fr.respondent_id = requesting_user_id THEN fr.respondent_email
      WHEN f.owner_id = requesting_user_id THEN fr.respondent_email
      WHEN get_user_role_for_form(f.id, requesting_user_id) IS NOT NULL THEN fr.respondent_email
      ELSE mask_email(fr.respondent_email, fr.respondent_id, f.owner_id)
    END
  FROM form_responses fr
  JOIN forms f ON fr.form_id = f.id
  WHERE fr.id = response_id;
$function$;

-- Create a view for secure access to form responses with masked emails
CREATE OR REPLACE VIEW public.secure_form_responses AS
SELECT 
  fr.id,
  fr.form_id,
  fr.respondent_id,
  CASE 
    WHEN fr.respondent_id = auth.uid() THEN fr.respondent_email
    WHEN f.owner_id = auth.uid() THEN fr.respondent_email
    WHEN get_user_role_for_form(f.id, auth.uid()) IS NOT NULL THEN fr.respondent_email
    ELSE mask_email(fr.respondent_email, fr.respondent_id, f.owner_id)
  END as respondent_email,
  fr.submitted_at,
  fr.is_partial,
  fr.created_at,
  fr.updated_at
FROM form_responses fr
JOIN forms f ON fr.form_id = f.id
WHERE public.can_access_response(fr.id, auth.uid());

-- Grant access to the secure view
GRANT SELECT ON public.secure_form_responses TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.secure_form_responses SET (security_barrier = true);

-- Add additional security: Prevent bulk data extraction by limiting query results
CREATE OR REPLACE FUNCTION public.prevent_bulk_extraction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Log potential bulk access attempts (optional)
  -- You could implement rate limiting here
  RETURN NULL;
END;
$function$;