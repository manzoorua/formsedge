-- Fix function search path security warnings by setting search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';