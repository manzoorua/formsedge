-- Phase 2: Database Schema Simplification
-- Remove chain-related columns from forms table
ALTER TABLE public.forms DROP COLUMN IF EXISTS chain_id;
ALTER TABLE public.forms DROP COLUMN IF EXISTS page_order;
ALTER TABLE public.forms DROP COLUMN IF EXISTS is_chain_root;

-- Drop form_chains table entirely
DROP TABLE IF EXISTS public.form_chains CASCADE;

-- Update form_transitions table to support direct form-to-form relationships
-- Keep the table but ensure it's simplified for direct transitions only
ALTER TABLE public.form_transitions DROP COLUMN IF EXISTS condition_field_id;
ALTER TABLE public.form_transitions DROP COLUMN IF EXISTS condition_operator;
ALTER TABLE public.form_transitions DROP COLUMN IF EXISTS condition_value;

-- Simplify to just from_form_id -> to_form_id with is_default flag
-- Add constraint to ensure only one transition per form
DROP INDEX IF EXISTS idx_form_transitions_unique_default;
CREATE UNIQUE INDEX idx_form_transitions_unique_from_form 
ON public.form_transitions (from_form_id) 
WHERE is_default = true;

-- Clean up chain references in partial_submissions table
ALTER TABLE public.partial_submissions DROP COLUMN IF EXISTS chain_id;
ALTER TABLE public.partial_submissions DROP COLUMN IF EXISTS chain_progress;
ALTER TABLE public.partial_submissions DROP COLUMN IF EXISTS current_step;
ALTER TABLE public.partial_submissions DROP COLUMN IF EXISTS total_steps;
ALTER TABLE public.partial_submissions DROP COLUMN IF EXISTS current_form_id;