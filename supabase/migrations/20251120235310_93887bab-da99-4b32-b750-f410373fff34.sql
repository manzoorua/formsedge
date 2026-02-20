-- Add url_params_config column to forms table
ALTER TABLE public.forms 
ADD COLUMN url_params_config jsonb NULL DEFAULT NULL;

-- Add comment explaining the structure
COMMENT ON COLUMN public.forms.url_params_config IS 
'Array of URL parameter configurations: [{name, label, description, include_in_responses, visible_in_exports, default_value, transitive_default}]';

-- Add url_params column to form_responses table
ALTER TABLE public.form_responses 
ADD COLUMN url_params jsonb NULL DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.form_responses.url_params IS 
'Key-value pairs of captured URL parameters: {param_name: "value"}';