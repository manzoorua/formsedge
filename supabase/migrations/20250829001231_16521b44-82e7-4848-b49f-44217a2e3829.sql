-- Create referral settings table for dynamic configuration
CREATE TABLE public.referral_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  CONSTRAINT valid_setting_key CHECK (
    setting_key IN (
      'referral_bonus_amount',
      'friend_discount_percentage', 
      'maximum_earning_per_referral',
      'payment_schedule_days',
      'payment_processing_frequency'
    )
  )
);

-- Create settings history for audit trail
CREATE TABLE public.referral_settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id uuid REFERENCES referral_settings(id),
  old_value jsonb,
  new_value jsonb,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_settings_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_settings
CREATE POLICY "Admins can manage referral settings" 
ON public.referral_settings 
FOR ALL 
USING (check_is_admin(auth.uid()));

CREATE POLICY "Authenticated users can read active settings" 
ON public.referral_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for referral_settings_history
CREATE POLICY "Admins can view settings history" 
ON public.referral_settings_history 
FOR SELECT 
USING (check_is_admin(auth.uid()));

-- Insert default values
INSERT INTO public.referral_settings (setting_key, setting_value, description) VALUES
('referral_bonus_amount', '{"value": 25.00, "currency": "USD"}', 'Amount paid to referrer for each successful referral'),
('friend_discount_percentage', '{"value": 50, "max_discount": 100}', 'Discount percentage for first subscription of referred friend'),
('maximum_earning_per_referral', '{"value": 500.00, "currency": "USD"}', 'Maximum amount that can be earned per referral'),
('payment_schedule_days', '{"value": "5-7 business days"}', 'Expected timeframe for referral reward payments'),
('payment_processing_frequency', '{"value": "Monthly", "day_of_month": 1}', 'How often referral rewards are processed');

-- Create trigger for settings history
CREATE OR REPLACE FUNCTION public.track_referral_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.referral_settings_history (
    setting_id, 
    old_value, 
    new_value, 
    changed_by
  ) VALUES (
    OLD.id,
    OLD.setting_value,
    NEW.setting_value,
    auth.uid()
  );
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER referral_settings_history_trigger
  BEFORE UPDATE ON public.referral_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.track_referral_settings_changes();

-- Add updated_at trigger
CREATE TRIGGER update_referral_settings_updated_at
  BEFORE UPDATE ON public.referral_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();