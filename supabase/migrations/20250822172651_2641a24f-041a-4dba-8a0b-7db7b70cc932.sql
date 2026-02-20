-- Add layout column to forms table
ALTER TABLE public.forms ADD COLUMN layout jsonb DEFAULT '{
  "columns": 1,
  "grid_gap": "md", 
  "responsive": true
}'::jsonb;

-- Update existing forms with default layout
UPDATE public.forms 
SET layout = '{
  "columns": 1,
  "grid_gap": "md",
  "responsive": true
}'::jsonb 
WHERE layout IS NULL;