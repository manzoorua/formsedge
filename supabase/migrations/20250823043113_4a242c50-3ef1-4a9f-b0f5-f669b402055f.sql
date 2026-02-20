-- Remove show_progress_bar column from forms table
ALTER TABLE public.forms DROP COLUMN IF EXISTS show_progress_bar;