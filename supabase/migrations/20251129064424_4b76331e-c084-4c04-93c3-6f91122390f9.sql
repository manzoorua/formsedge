-- Add background column to forms table for storing form design settings
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS background JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.forms.background IS 'JSON object containing background settings: type (color/gradient/image), value, opacity, position, size';