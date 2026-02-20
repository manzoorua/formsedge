-- Add width column to form_fields table to support layout controls
ALTER TABLE form_fields ADD COLUMN IF NOT EXISTS width text CHECK (width IN ('full', 'half', 'third', 'quarter'));