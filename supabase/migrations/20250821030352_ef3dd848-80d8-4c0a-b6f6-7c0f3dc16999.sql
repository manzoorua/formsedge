-- Phase 1: Database Schema Enhancements

-- Enhance form_fields table with new functionality
ALTER TABLE public.form_fields 
ADD COLUMN IF NOT EXISTS conditional_logic JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS calculations JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS styling JSONB DEFAULT NULL;

-- Update validation_rules to be more comprehensive
COMMENT ON COLUMN public.form_fields.conditional_logic IS 'JSON structure for show/hide conditions and branching logic';
COMMENT ON COLUMN public.form_fields.calculations IS 'JSON structure for mathematical calculations and formulas';
COMMENT ON COLUMN public.form_fields.styling IS 'JSON structure for individual field styling and customization';

-- Create partial_submissions table for auto-save functionality
CREATE TABLE IF NOT EXISTS public.partial_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  respondent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on partial_submissions
ALTER TABLE public.partial_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for partial_submissions
CREATE POLICY "Users can create partial submissions for public forms"
ON public.partial_submissions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = partial_submissions.form_id 
    AND forms.is_public = true 
    AND forms.status = 'published'
    AND forms.accept_responses = true
  )
);

CREATE POLICY "Users can view their own partial submissions"
ON public.partial_submissions
FOR SELECT
USING (
  (auth.uid() = respondent_id) OR 
  (session_id IS NOT NULL AND session_id != '')
);

CREATE POLICY "Users can update their own partial submissions"
ON public.partial_submissions
FOR UPDATE
USING (
  (auth.uid() = respondent_id) OR 
  (session_id IS NOT NULL AND session_id != '')
);

CREATE POLICY "Form owners can view partial submissions"
ON public.partial_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = partial_submissions.form_id 
    AND forms.owner_id = auth.uid()
  )
);

-- Create form_themes table for reusable design templates
CREATE TABLE IF NOT EXISTS public.form_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  theme_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on form_themes
ALTER TABLE public.form_themes ENABLE ROW LEVEL SECURITY;

-- Create policies for form_themes
CREATE POLICY "Anyone can view public themes"
ON public.form_themes
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own themes"
ON public.form_themes
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own themes"
ON public.form_themes
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own themes"
ON public.form_themes
FOR UPDATE
USING (auth.uid() = created_by);

-- Enhance forms table with advanced branding and settings
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES public.form_themes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#64748b',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS enable_partial_save BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_save_interval INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS show_progress_bar BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS thank_you_message TEXT DEFAULT 'Thank you for your submission!',
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS enable_analytics BOOLEAN DEFAULT true;

-- Create field analytics table for detailed form insights
CREATE TABLE IF NOT EXISTS public.field_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  drop_offs INTEGER DEFAULT 0,
  avg_time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id, field_id, date)
);

-- Enable RLS on field_analytics
ALTER TABLE public.field_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for field_analytics
CREATE POLICY "Form owners can view field analytics"
ON public.field_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = field_analytics.form_id 
    AND (forms.owner_id = auth.uid() OR get_user_role_for_form(forms.id, auth.uid()) IS NOT NULL)
  )
);

CREATE POLICY "System can insert field analytics"
ON public.field_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update field analytics"
ON public.field_analytics
FOR UPDATE
USING (true);

-- Create trigger for updating form updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_form_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_form_updated_at();

-- Create trigger for updating theme updated_at timestamp
CREATE TRIGGER update_form_themes_updated_at
  BEFORE UPDATE ON public.form_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean up expired partial submissions
CREATE OR REPLACE FUNCTION public.cleanup_expired_partial_submissions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.partial_submissions
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default form themes
INSERT INTO public.form_themes (name, description, theme_data, is_default, is_public) VALUES
('Default', 'Clean and professional default theme', '{
  "primaryColor": "#3b82f6",
  "secondaryColor": "#64748b",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937",
  "borderRadius": "8px",
  "fontFamily": "Inter",
  "buttonStyle": "solid",
  "inputStyle": "bordered"
}', true, true),
('Minimal', 'Clean minimal design with subtle borders', '{
  "primaryColor": "#000000",
  "secondaryColor": "#6b7280",
  "backgroundColor": "#ffffff",
  "textColor": "#000000",
  "borderRadius": "4px",
  "fontFamily": "Inter",
  "buttonStyle": "outline",
  "inputStyle": "minimal"
}', false, true),
('Modern', 'Bold and modern with gradients', '{
  "primaryColor": "#8b5cf6",
  "secondaryColor": "#06b6d4",
  "backgroundColor": "#ffffff",
  "textColor": "#1f2937",
  "borderRadius": "12px",
  "fontFamily": "Inter",
  "buttonStyle": "gradient",
  "inputStyle": "filled"
}', false, true);

-- Add comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_partial_submissions_form_session ON public.partial_submissions(form_id, session_id);
CREATE INDEX IF NOT EXISTS idx_partial_submissions_expires_at ON public.partial_submissions(expires_at);
CREATE INDEX IF NOT EXISTS idx_field_analytics_form_date ON public.field_analytics(form_id, date);
CREATE INDEX IF NOT EXISTS idx_forms_theme_id ON public.forms(theme_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_conditional_logic ON public.form_fields USING GIN(conditional_logic);