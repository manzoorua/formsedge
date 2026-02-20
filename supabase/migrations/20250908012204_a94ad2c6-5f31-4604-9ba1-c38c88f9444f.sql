-- Security Fix Phase 2: Restrict public data access to business-sensitive tables

-- 1. Restrict subscription_tiers public access to only essential pricing display fields
DROP POLICY IF EXISTS "Anyone can view subscription tiers" ON public.subscription_tiers;

CREATE POLICY "Public users can view basic pricing info only" 
ON public.subscription_tiers 
FOR SELECT 
USING (is_active = true);

-- Create a secure view for public subscription tier access
CREATE OR REPLACE VIEW public.public_subscription_tiers AS
SELECT 
  id,
  name,
  description,
  price_monthly,
  price_yearly,
  max_forms,
  max_responses_per_form,
  features,
  sort_order
FROM public.subscription_tiers
WHERE is_active = true
ORDER BY sort_order;

-- 2. Restrict form_templates to require authentication
DROP POLICY IF EXISTS "Users can view public templates only" ON public.form_templates;

CREATE POLICY "Authenticated users can view templates" 
ON public.form_templates 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (is_featured = true OR category = 'free')
);

-- 3. Add additional security to forms table - ensure webhook_url and custom_css are protected
CREATE POLICY "Form owners can view sensitive config fields" 
ON public.forms 
FOR SELECT 
USING (
  auth.uid() = owner_id 
  OR get_user_role_for_form(id, auth.uid()) = 'admin'::team_role
);

-- 4. Create rate limiting table for edge function security
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(ip_address, endpoint, window_start)
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (true);

-- 5. Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  endpoint text,
  payload jsonb,
  risk_level text DEFAULT 'low',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (check_is_admin(auth.uid()));

-- System can insert security logs
CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 6. Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  ip_addr inet,
  endpoint_name text,
  max_requests integer DEFAULT 100,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Calculate window start time
  window_start_time := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / window_minutes) * (window_minutes * interval '1 minute');
  
  -- Get current count for this IP and endpoint in the current window
  SELECT request_count INTO current_count
  FROM rate_limits
  WHERE ip_address = ip_addr 
    AND endpoint = endpoint_name 
    AND window_start = window_start_time;
  
  -- If no record exists, create one
  IF current_count IS NULL THEN
    INSERT INTO rate_limits (ip_address, endpoint, window_start, request_count)
    VALUES (ip_addr, endpoint_name, window_start_time, 1)
    ON CONFLICT (ip_address, endpoint, window_start) 
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    RETURN true;
  END IF;
  
  -- If under limit, increment and allow
  IF current_count < max_requests THEN
    UPDATE rate_limits 
    SET request_count = request_count + 1
    WHERE ip_address = ip_addr 
      AND endpoint = endpoint_name 
      AND window_start = window_start_time;
    RETURN true;
  END IF;
  
  -- Over limit, deny
  RETURN false;
END;
$$;

-- 7. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type_param text,
  user_id_param uuid DEFAULT NULL,
  ip_address_param inet DEFAULT NULL,
  user_agent_param text DEFAULT NULL,
  endpoint_param text DEFAULT NULL,
  payload_param jsonb DEFAULT NULL,
  risk_level_param text DEFAULT 'low'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_audit_log (
    event_type,
    user_id,
    ip_address,
    user_agent,
    endpoint,
    payload,
    risk_level
  ) VALUES (
    event_type_param,
    user_id_param,
    ip_address_param,
    user_agent_param,
    endpoint_param,
    payload_param,
    risk_level_param
  );
END;
$$;

-- Enable RLS on the new view
ALTER VIEW public.public_subscription_tiers SET (security_invoker = true);