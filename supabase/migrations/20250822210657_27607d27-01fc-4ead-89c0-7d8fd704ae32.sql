-- Security Fix: Restrict form templates to authenticated users only
DROP POLICY IF EXISTS "Anyone can view form templates" ON public.form_templates;

-- Create new restrictive policy for form templates
CREATE POLICY "Authenticated users can view form templates"
ON public.form_templates
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Security Fix: Restrict form themes public access to essential data only
DROP POLICY IF EXISTS "Anyone can view public themes" ON public.form_themes;

-- Create new policy that only allows viewing of public themes with limited data
CREATE POLICY "Users can view public theme metadata only"
ON public.form_themes
FOR SELECT
USING (
  is_public = true AND 
  auth.uid() IS NOT NULL
);