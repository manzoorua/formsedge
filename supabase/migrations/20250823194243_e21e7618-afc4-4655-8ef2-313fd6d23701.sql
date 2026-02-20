-- Fix security issues from previous migration

-- Remove the problematic security definer view and replace with a proper function approach
DROP VIEW IF EXISTS public.secure_form_responses;

-- Fix search_path issues in existing functions
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

CREATE OR REPLACE FUNCTION public.prevent_bulk_extraction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log potential bulk access attempts (optional)
  -- You could implement rate limiting here
  RETURN NULL;
END;
$function$;

-- Instead of a security definer view, let's create a function that returns masked response data
CREATE OR REPLACE FUNCTION public.get_secure_form_responses(form_id_param uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  form_id uuid,
  respondent_id uuid,
  respondent_email text,
  submitted_at timestamptz,
  is_partial boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  WHERE 
    public.can_access_response(fr.id, auth.uid())
    AND (form_id_param IS NULL OR fr.form_id = form_id_param);
$function$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_secure_form_responses TO authenticated;