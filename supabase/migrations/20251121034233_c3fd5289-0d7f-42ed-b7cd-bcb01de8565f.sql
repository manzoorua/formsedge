-- Add ref column to form_fields for Recall Information feature
ALTER TABLE form_fields
ADD COLUMN IF NOT EXISTS ref text;

-- Create unique index to ensure ref is unique within each form
CREATE UNIQUE INDEX IF NOT EXISTS form_fields_form_id_ref_idx
ON form_fields(form_id, ref)
WHERE ref IS NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN form_fields.ref IS 'Stable reference key for Recall tokens (e.g., "full_name", "company"). Must be unique per form.';