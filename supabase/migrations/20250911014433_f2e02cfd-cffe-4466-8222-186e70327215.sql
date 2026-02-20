-- Update RLS policy to allow public access to featured templates
DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.form_templates;

CREATE POLICY "Public can view featured templates, authenticated users can view free templates" 
ON public.form_templates 
FOR SELECT 
USING (
  (is_featured = true) OR 
  (auth.uid() IS NOT NULL AND category = 'free'::text)
);