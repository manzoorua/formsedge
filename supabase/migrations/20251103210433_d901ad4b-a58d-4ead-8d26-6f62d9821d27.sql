-- Create system configuration table
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('feature_flags', 'tier_limits', 'smtp', 'general', 'security')),
  description TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read system config
CREATE POLICY "Admins can view all system config"
ON public.system_config
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can insert system config
CREATE POLICY "Admins can create system config"
ON public.system_config
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update system config
CREATE POLICY "Admins can update system config"
ON public.system_config
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can delete system config
CREATE POLICY "Admins can delete system config"
ON public.system_config
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit log table for system config changes
CREATE TABLE IF NOT EXISTS public.system_config_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.system_config(id) ON DELETE CASCADE,
  config_key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.system_config_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view config audit logs"
ON public.system_config_audit
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert config audit logs"
ON public.system_config_audit
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create function to log config changes
CREATE OR REPLACE FUNCTION public.log_system_config_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if value actually changed
  IF (TG_OP = 'UPDATE' AND OLD.config_value IS DISTINCT FROM NEW.config_value) THEN
    INSERT INTO public.system_config_audit (
      config_id,
      config_key,
      old_value,
      new_value,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.config_key,
      OLD.config_value,
      NEW.config_value,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for audit logging
CREATE TRIGGER system_config_audit_trigger
AFTER UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION public.log_system_config_change();

-- Create index for faster lookups
CREATE INDEX idx_system_config_key ON public.system_config(config_key);
CREATE INDEX idx_system_config_category ON public.system_config(category);
CREATE INDEX idx_system_config_audit_config_id ON public.system_config_audit(config_id);

-- Insert default configuration values (explicitly specifying columns)
INSERT INTO public.system_config (config_key, config_value, category, description, is_sensitive) VALUES
  ('feature_flags', '{"maintenance_mode": false, "new_user_signups": true, "email_notifications": true, "analytics_tracking": true}', 'feature_flags', 'Global feature toggles', false),
  ('tier_limits_free', '{"max_forms": 3, "max_responses_per_form": 100, "max_file_upload_mb": 5, "advanced_features": false, "custom_branding": false, "integrations": false}', 'tier_limits', 'Free tier limitations', false),
  ('tier_limits_pro', '{"max_forms": 50, "max_responses_per_form": 1000, "max_file_upload_mb": 50, "advanced_features": true, "custom_branding": true, "integrations": true}', 'tier_limits', 'Pro tier limitations', false),
  ('tier_limits_enterprise', '{"max_forms": -1, "max_responses_per_form": -1, "max_file_upload_mb": 500, "advanced_features": true, "custom_branding": true, "integrations": true, "team_collaboration": true, "white_label": true}', 'tier_limits', 'Enterprise tier limitations (unlimited)', false),
  ('smtp_settings', '{"enabled": false, "host": "", "port": 587, "username": "", "from_email": "", "from_name": "FormsEdge"}', 'smtp', 'SMTP email configuration', true),
  ('security_settings', '{"max_login_attempts": 5, "session_timeout_minutes": 60, "require_email_verification": true, "password_min_length": 8}', 'security', 'Security and authentication settings', false)
ON CONFLICT (config_key) DO NOTHING;