-- Fix duplicate page_order values in form chains
WITH ranked_forms AS (
  SELECT 
    id, 
    chain_id, 
    page_order,
    ROW_NUMBER() OVER (PARTITION BY chain_id ORDER BY created_at) - 1 AS new_page_order
  FROM forms 
  WHERE chain_id IS NOT NULL
),
duplicates AS (
  SELECT chain_id, page_order, COUNT(*) as count
  FROM forms 
  WHERE chain_id IS NOT NULL
  GROUP BY chain_id, page_order
  HAVING COUNT(*) > 1
)
UPDATE forms 
SET page_order = ranked_forms.new_page_order
FROM ranked_forms
WHERE forms.id = ranked_forms.id
  AND forms.chain_id IN (SELECT chain_id FROM duplicates);

-- Add unique constraint to prevent future duplicates
ALTER TABLE forms 
ADD CONSTRAINT unique_chain_page_order 
UNIQUE (chain_id, page_order);