-- Fix critical admin access security vulnerability
-- Replace the temporary "all users are admin" function with proper admin verification

-- Drop the existing insecure function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create a secure admin check function that uses the admin_users table
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Check if user exists in admin_users table
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = $1
  );
$function$;

-- Create a secure function for initial admin setup (one-time use)
CREATE OR REPLACE FUNCTION public.setup_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow if no admins exist yet
  IF NOT EXISTS (SELECT 1 FROM public.admin_users LIMIT 1) THEN
    -- Add the current authenticated user as the first admin
    INSERT INTO public.admin_users (user_id, role, permissions)
    VALUES (
      auth.uid(), 
      'admin', 
      '{"referral_settings": true, "user_management": true, "system_admin": true}'::jsonb
    );
    RETURN true;
  END IF;
  RETURN false;
END;
$function$;

-- Create function to safely promote users to admin (only by existing admins)
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id uuid, admin_role text DEFAULT 'admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only existing admins can promote others
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can promote users to admin';
  END IF;
  
  -- Validate role
  IF admin_role NOT IN ('admin', 'moderator') THEN
    RAISE EXCEPTION 'Invalid admin role specified';
  END IF;
  
  -- Insert new admin (will fail if already exists due to unique constraint)
  INSERT INTO public.admin_users (user_id, role, created_by, permissions)
  VALUES (
    target_user_id, 
    admin_role::text, 
    auth.uid(),
    CASE 
      WHEN admin_role = 'admin' THEN '{"referral_settings": true, "user_management": true, "system_admin": true}'::jsonb
      ELSE '{"referral_settings": true}'::jsonb
    END
  );
  
  RETURN true;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'User is already an administrator';
END;
$function$;

-- Add audit logging for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_name text,
  target_table_name text DEFAULT NULL,
  target_record_id uuid DEFAULT NULL,
  old_data jsonb DEFAULT NULL,
  new_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_table,
    target_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    action_name,
    target_table_name,
    target_record_id,
    old_data,
    new_data
  );
END;
$function$;

-- Add trigger to log referral settings changes
CREATE OR REPLACE FUNCTION public.audit_referral_settings_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log the change
  PERFORM public.log_admin_action(
    'referral_settings_update',
    'referral_settings',
    NEW.id,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    to_jsonb(NEW)
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger for referral settings audit
DROP TRIGGER IF EXISTS audit_referral_settings_trigger ON public.referral_settings;
CREATE TRIGGER audit_referral_settings_trigger
  AFTER INSERT OR UPDATE ON public.referral_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_referral_settings_changes();

-- Add comment explaining the security measures
COMMENT ON FUNCTION public.is_admin IS 'Securely checks if a user is an administrator by verifying against admin_users table';
COMMENT ON FUNCTION public.setup_first_admin IS 'One-time function to setup the first administrator - only works when no admins exist';
COMMENT ON FUNCTION public.promote_to_admin IS 'Allows existing admins to promote other users to admin roles with proper validation';
COMMENT ON TABLE public.admin_audit_log IS 'Comprehensive audit trail for all administrative actions';