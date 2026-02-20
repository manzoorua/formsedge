-- Fix chain structure and ensure proper root form
-- First, ensure the chain exists
INSERT INTO form_chains (id, title, description, owner_id, status) 
SELECT '74589ef3-93e2-41fb-9068-6b7f9cc3ed90', 'Test Multipart Chain', 'Multi-page form workflow', '843b3805-42d8-47e6-82bd-634f1e7121b8', 'draft'
WHERE NOT EXISTS (SELECT 1 FROM form_chains WHERE id = '74589ef3-93e2-41fb-9068-6b7f9cc3ed90');

-- Find the earliest form in the chain to make it the root
UPDATE forms 
SET is_chain_root = true, page_order = 0
WHERE id = (
  SELECT id FROM forms 
  WHERE chain_id = '74589ef3-93e2-41fb-9068-6b7f9cc3ed90' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Ensure all other forms in the chain are not marked as root
UPDATE forms 
SET is_chain_root = false
WHERE chain_id = '74589ef3-93e2-41fb-9068-6b7f9cc3ed90' 
AND id != (
  SELECT id FROM forms 
  WHERE chain_id = '74589ef3-93e2-41fb-9068-6b7f9cc3ed90' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Fix page order to be sequential
WITH ordered_forms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_order
  FROM forms 
  WHERE chain_id = '74589ef3-93e2-41fb-9068-6b7f9cc3ed90'
)
UPDATE forms 
SET page_order = ordered_forms.new_order
FROM ordered_forms 
WHERE forms.id = ordered_forms.id;