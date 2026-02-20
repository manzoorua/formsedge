-- Add missing RLS policies for admin_users table

-- Allow existing admins to insert new admin users
-- Also allow service role and handle bootstrap scenario
CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (
  -- Allow if user is already an admin OR if no admins exist yet (bootstrap)
  (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())) 
  OR 
  (NOT EXISTS (SELECT 1 FROM public.admin_users))
);

-- Allow existing admins to update admin user records
CREATE POLICY "Admins can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

-- Allow existing admins to delete admin user records
CREATE POLICY "Admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);