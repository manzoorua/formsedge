-- Normalize all existing form field data to ensure consistent types
UPDATE public.form_fields
SET 
  validation_rules = COALESCE(validation_rules, '{}'::jsonb),
  conditional_logic = COALESCE(conditional_logic, '{}'::jsonb),
  options = COALESCE(options, '[]'::jsonb),
  calculations = COALESCE(calculations, '{}'::jsonb),
  styling = COALESCE(styling, '{}'::jsonb)
WHERE 
  validation_rules IS NULL 
  OR conditional_logic IS NULL 
  OR options IS NULL 
  OR calculations IS NULL 
  OR styling IS NULL;