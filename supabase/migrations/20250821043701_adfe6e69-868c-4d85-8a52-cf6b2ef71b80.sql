-- Add missing field types to the field_type enum
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'time';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'matrix';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'divider';
ALTER TYPE field_type ADD VALUE IF NOT EXISTS 'html';