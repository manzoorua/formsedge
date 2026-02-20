-- Fix critical security issue: Remove public access to subscribers table
-- The current policy "Edge functions can manage subscriptions" with "true" expression
-- allows public read access to all subscriber data including emails

-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Edge functions can manage subscriptions" ON public.subscribers;

-- Create restricted policies for edge functions (service role only)
-- These policies will only apply when using the service role key
CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscribers 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create policy for authenticated users to insert their own subscription
CREATE POLICY "Users can create their own subscription" 
ON public.subscribers 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- Create policy for authenticated users to update their own subscription  
CREATE POLICY "Users can update their own subscription"
ON public.subscribers 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid() OR email = auth.email())
WITH CHECK (user_id = auth.uid() OR email = auth.email());

-- The existing "Users can view their own subscription" policy is already correct
-- It only allows users to see their own subscription data

-- Verify RLS is enabled (should already be enabled)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;