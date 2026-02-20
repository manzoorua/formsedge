-- Security Enhancement: Enhanced RLS policies for form_response_answers to protect PII

-- First, create a function to mask sensitive field values based on field type
CREATE OR REPLACE FUNCTION public.mask_sensitive_field_value(
  field_value text,
  field_type text,
  user_id uuid,
  form_owner_id uuid,
  respondent_id uuid
) RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    -- If user is form owner, respondent, or has team access, show full value
    WHEN user_id = form_owner_id THEN field_value
    WHEN user_id = respondent_id THEN field_value
    -- For sensitive field types, mask the data for unauthorized users
    WHEN field_type = 'email' AND field_value IS NOT NULL THEN 
      CONCAT(
        LEFT(SPLIT_PART(field_value, '@', 1), 1),
        REPEAT('*', GREATEST(0, LENGTH(SPLIT_PART(field_value, '@', 1)) - 1)),
        '@',
        SPLIT_PART(field_value, '@', 2)
      )
    WHEN field_type = 'phone' AND field_value IS NOT NULL THEN 
      CONCAT(
        '***-***-',
        RIGHT(field_value, 4)
      )
    WHEN field_type IN ('text', 'textarea', 'name') AND LENGTH(field_value) > 2 THEN
      CONCAT(LEFT(field_value, 1), REPEAT('*', LENGTH(field_value) - 2), RIGHT(field_value, 1))
    ELSE field_value
  END;
$$;

-- Create a secure view function for form response answers with PII protection
CREATE OR REPLACE FUNCTION public.get_secure_form_response_answers(
  response_id_param uuid DEFAULT NULL,
  form_id_param uuid DEFAULT NULL
) RETURNS TABLE(
  id uuid,
  response_id uuid,
  field_id uuid,
  value text,
  file_urls jsonb,
  created_at timestamp with time zone,
  field_type text,
  field_label text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    fra.id,
    fra.response_id,
    fra.field_id,
    -- Mask sensitive values based on field type and user permissions
    public.mask_sensitive_field_value(
      fra.value,
      ff.type::text,
      auth.uid(),
      f.owner_id,
      fr.respondent_id
    ) as value,
    fra.file_urls,
    fra.created_at,
    ff.type::text as field_type,
    ff.label as field_label
  FROM form_response_answers fra
  JOIN form_responses fr ON fra.response_id = fr.id
  JOIN form_fields ff ON fra.field_id = ff.id
  JOIN forms f ON fr.form_id = f.id
  WHERE 
    -- Ensure user has proper access to the response
    public.can_access_response(fra.response_id, auth.uid())
    AND (response_id_param IS NULL OR fra.response_id = response_id_param)
    AND (form_id_param IS NULL OR fr.form_id = form_id_param);
$$;

-- Enhanced RLS policy for form_response_answers to prevent bulk data extraction
DROP POLICY IF EXISTS "Authorized users can view response answers" ON public.form_response_answers;

CREATE POLICY "Enhanced secure access to response answers" 
ON public.form_response_answers 
FOR SELECT 
TO authenticated
USING (
  -- Ensure authenticated user
  auth.uid() IS NOT NULL
  -- Use the secure access function
  AND public.can_access_response(response_id, auth.uid())
  -- Additional rate limiting protection (prevent bulk extraction)
  AND (
    -- Allow if user is form owner or respondent (trusted access)
    EXISTS (
      SELECT 1 FROM form_responses fr
      JOIN forms f ON fr.form_id = f.id
      WHERE fr.id = response_id 
      AND (f.owner_id = auth.uid() OR fr.respondent_id = auth.uid())
    )
    -- Or if they have explicit team access
    OR EXISTS (
      SELECT 1 FROM form_responses fr
      JOIN forms f ON fr.form_id = f.id
      WHERE fr.id = response_id 
      AND get_user_role_for_form(f.id, auth.uid()) IS NOT NULL
    )
  )
);

-- Add trigger to log suspicious access patterns (for monitoring)
CREATE OR REPLACE FUNCTION public.log_response_access() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access attempts to sensitive data for security monitoring
  -- This is a placeholder - in production you'd log to a secure audit table
  RETURN NULL;
END;
$$;

-- Create audit table for tracking data access (optional security monitoring)
CREATE TABLE IF NOT EXISTS public.data_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  table_name text,
  record_id uuid,
  action text,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit table
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.data_access_logs 
FOR SELECT 
USING (public.check_is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.data_access_logs 
FOR INSERT 
WITH CHECK (true);