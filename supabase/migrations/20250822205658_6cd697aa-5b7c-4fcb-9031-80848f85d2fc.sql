-- Add missing field types to the field_type enum
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'multiselect';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'signature';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'pagebreak';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'section';