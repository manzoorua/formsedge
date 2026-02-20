-- Update chatbot settings to use app mode instead of iframe mode
UPDATE chatbot_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{mode}', 
  '"app"'
)
WHERE setting_key = 'chatbot_config' AND setting_value->>'mode' = 'iframe';

-- Insert default config if none exists
INSERT INTO chatbot_settings (setting_key, setting_value)
SELECT 'chatbot_config', '{"enabled": false, "widgetId": "", "initialState": "closed", "mode": "app"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM chatbot_settings WHERE setting_key = 'chatbot_config'
);