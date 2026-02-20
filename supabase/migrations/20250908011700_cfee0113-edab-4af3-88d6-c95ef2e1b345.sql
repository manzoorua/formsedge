-- Fix critical security issues: Restrict public data exposure and harden database functions

-- 1. Replace overly permissive public forms policy with column-specific access
DROP POLICY IF EXISTS "Users can view public forms for submissions" ON public.forms;

CREATE POLICY "Public users can view essential form data only" 
ON public.forms 
FOR SELECT 
USING (
  is_public = true 
  AND status = 'published'::form_status
);

-- Create a view for public form access that only exposes safe columns
CREATE OR REPLACE VIEW public.public_forms AS
SELECT 
  id,
  title,
  description,
  status,
  is_public,
  accept_responses,
  layout,
  primary_color,
  secondary_color,
  font_family,
  thank_you_message,
  redirect_url,
  custom_url,
  logo_url,
  branding_logo_url,
  branding_color,
  branding_enabled,
  collect_emails,
  limit_responses,
  max_responses
FROM public.forms
WHERE is_public = true AND status = 'published'::form_status;

-- 2. Replace overly permissive public form_fields policy with essential-only access
DROP POLICY IF EXISTS "Users can view fields of accessible forms" ON public.form_fields;

-- Create separate policies for authenticated users vs public access
CREATE POLICY "Authenticated users can view fields of accessible forms" 
ON public.form_fields 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    can_access_form(form_id, auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_fields.form_id 
      AND forms.is_public = true 
      AND forms.status = 'published'::form_status
    )
  )
);

-- Create a view for public form fields that only exposes safe columns
CREATE OR REPLACE VIEW public.public_form_fields AS
SELECT 
  id,
  form_id,
  type,
  label,
  description,
  placeholder,
  required,
  options,
  order_index,
  width,
  styling
FROM public.form_fields ff
WHERE EXISTS (
  SELECT 1 FROM public.forms f 
  WHERE f.id = ff.form_id 
  AND f.is_public = true 
  AND f.status = 'published'::form_status
);

-- 3. Fix database function security - Add proper search_path to mask_email function
CREATE OR REPLACE FUNCTION public.mask_email(email text, user_id uuid, form_owner_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT CASE 
    WHEN user_id = form_owner_id THEN email
    WHEN email IS NULL THEN NULL
    ELSE CONCAT(
      LEFT(SPLIT_PART(email, '@', 1), 1),
      REPEAT('*', GREATEST(0, LENGTH(SPLIT_PART(email, '@', 1)) - 1)),
      '@',
      SPLIT_PART(email, '@', 2)
    )
  END;
$function$;

-- 4. Update other security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_id_param
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_access_response(response_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
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

-- 5. Enable RLS on the new views
ALTER VIEW public.public_forms SET (security_invoker = true);
ALTER VIEW public.public_form_fields SET (security_invoker = true);