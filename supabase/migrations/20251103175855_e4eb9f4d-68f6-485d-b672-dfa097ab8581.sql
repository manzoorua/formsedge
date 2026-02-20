-- Fix overly permissive RLS policies on subscribers and usage_tracking tables
-- These policies allowed ANY authenticated user to view/modify all data

-- ============================================================
-- Fix subscribers table RLS policies
-- ============================================================

-- Drop the dangerous policy that allows all operations
DROP POLICY IF EXISTS "Edge functions can manage subscriptions" ON public.subscribers;

-- Drop the old service role policy if it exists
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscribers;

-- User policies already exist and are correct:
-- - "Users can view their own subscription" (SELECT where user_id = auth.uid() OR email = auth.email())
-- - "Users can create their own subscription" (INSERT with check)
-- - "Users can update their own subscription" (UPDATE with proper checks)

-- Edge functions using SUPABASE_SERVICE_ROLE_KEY bypass RLS automatically
-- No special policy needed for them

-- ============================================================
-- Fix usage_tracking table RLS policies
-- ============================================================

-- Drop the dangerous policy that allows all operations
DROP POLICY IF EXISTS "System can manage usage tracking" ON public.usage_tracking;

-- User view policy already exists and is correct:
-- - "Users can view their own usage" (SELECT where user_id = auth.uid())

-- No INSERT/UPDATE/DELETE policies for regular users
-- Edge functions with service_role bypass RLS for system operations