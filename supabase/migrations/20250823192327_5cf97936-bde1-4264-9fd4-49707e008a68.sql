-- Fix infinite recursion in admin_users RLS policies

-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create a security definer function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.check_is_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_id_param
  );
$function$;

-- Create new RLS policies using the security definer function

-- Allow viewing admin users for existing admins
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.check_is_admin(auth.uid()));

-- Allow inserting admin users for existing admins OR if no admins exist (bootstrap)
CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (
  public.check_is_admin(auth.uid()) 
  OR 
  (NOT EXISTS (SELECT 1 FROM public.admin_users))
);

-- Allow updating admin users for existing admins
CREATE POLICY "Admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (public.check_is_admin(auth.uid()));

-- Allow deleting admin users for existing admins
CREATE POLICY "Admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (public.check_is_admin(auth.uid()));