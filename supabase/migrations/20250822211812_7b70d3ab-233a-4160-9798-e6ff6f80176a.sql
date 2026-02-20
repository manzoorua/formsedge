-- Phase 1: Critical Business Data Protection Fixes

-- 1. Restrict form_templates access to prevent business data exposure
-- Replace overly permissive policy with proper access control
DROP POLICY IF EXISTS "Authenticated users can view form templates" ON public.form_templates;

-- Create secure template access policies
CREATE POLICY "Users can view public templates only" 
ON public.form_templates 
FOR SELECT 
USING (is_featured = true OR category = 'free');

-- Prevent unauthorized template modifications
CREATE POLICY "Only admins can manage templates" 
ON public.form_templates 
FOR INSERT 
WITH CHECK (false); -- No user insertions allowed for now

CREATE POLICY "Only admins can update templates" 
ON public.form_templates 
FOR UPDATE 
USING (false); -- No user updates allowed for now

CREATE POLICY "Only admins can delete templates" 
ON public.form_templates 
FOR DELETE 
USING (false); -- No user deletions allowed for now

-- 2. Protect theme configurations from exposing sensitive business data
-- Update existing policies to be more restrictive
DROP POLICY IF EXISTS "Users can view public theme metadata only" ON public.form_themes;

-- Create more secure theme access policy
CREATE POLICY "Users can view basic public theme info only" 
ON public.form_themes 
FOR SELECT 
USING (
  (is_public = true AND auth.uid() IS NOT NULL) OR 
  (auth.uid() = created_by)
);

-- 3. Enhance form response privacy with email masking function
-- Create function to mask email addresses for non-owners
CREATE OR REPLACE FUNCTION public.mask_email(email text, user_id uuid, form_owner_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
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
$$;

-- 4. Secure database functions with proper search_path
-- Update existing functions for security hardening
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_for_form(form_id uuid, user_id uuid)
RETURNS team_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.team_members 
  WHERE team_members.form_id = $1 AND team_members.user_id = $2 AND accepted_at IS NOT NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_form_owner(form_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.forms 
    WHERE id = $1 AND owner_id = $2
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_form(form_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    public.is_form_owner($1, $2) OR 
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.form_id = $1 AND team_members.user_id = $2 AND accepted_at IS NOT NULL
    );
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_partial_submissions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.partial_submissions
  WHERE expires_at < now();
END;
$$;