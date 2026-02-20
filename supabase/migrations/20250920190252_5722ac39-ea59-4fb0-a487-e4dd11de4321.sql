-- Update chatbot config to explicitly set mode to 'script'
UPDATE chatbot_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{mode}', 
  '"script"'
)
WHERE setting_key = 'chatbot_config';

-- Also ensure width and height are set for proper sizing
UPDATE chatbot_settings 
SET setting_value = jsonb_set(
  jsonb_set(
    setting_value, 
    '{width}', 
    '400'
  ),
  '{height}', 
  '600'
)
WHERE setting_key = 'chatbot_config';