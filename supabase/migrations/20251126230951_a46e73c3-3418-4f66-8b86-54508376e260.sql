-- Add diagnostic_enabled flag to existing feature_flags config
UPDATE system_config
SET config_value = config_value || '{"diagnostic_enabled": false}'::jsonb,
    updated_at = now()
WHERE config_key = 'feature_flags';