-- Fix potential security issue with profiles table access
-- Add explicit policy to prevent any unauthorized access

-- First, drop the existing policies to recreate them more securely
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;

-- Create more restrictive policies with explicit authentication checks
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can only insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can only update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

-- Explicitly deny all access to unauthenticated users
CREATE POLICY "Deny all access to unauthenticated users"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Add a comment explaining the security measures
COMMENT ON TABLE public.profiles IS 'User profile data with strict RLS policies - only profile owners can access their own data';