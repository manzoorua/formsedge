-- Fix chatbot initialState to 'closed' for floating bubble display
UPDATE chatbot_settings 
SET 
  setting_value = jsonb_set(
    setting_value, 
    '{initialState}', 
    '"closed"'
  ),
  updated_at = now()
WHERE setting_key = 'chatbot_config' 
  AND setting_value->>'initialState' = 'open';