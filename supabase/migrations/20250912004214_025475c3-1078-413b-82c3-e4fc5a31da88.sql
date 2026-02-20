-- Create form_integrations table to track connected integrations per form
CREATE TABLE public.form_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL,
  integration_type TEXT NOT NULL, -- 'webhook', 'n8n', 'zapier', 'email', etc.
  name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'connected', -- 'connected', 'disconnected', 'error', 'testing'
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.form_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for form_integrations
CREATE POLICY "Users can manage integrations of their forms" 
ON public.form_integrations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM forms 
    WHERE forms.id = form_integrations.form_id 
    AND (forms.owner_id = auth.uid() OR get_user_role_for_form(forms.id, auth.uid()) = ANY(ARRAY['editor'::team_role, 'admin'::team_role]))
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_form_integrations_updated_at
BEFORE UPDATE ON public.form_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_form_integrations_form_id ON public.form_integrations(form_id);
CREATE INDEX idx_form_integrations_type ON public.form_integrations(integration_type);
CREATE INDEX idx_form_integrations_status ON public.form_integrations(status);