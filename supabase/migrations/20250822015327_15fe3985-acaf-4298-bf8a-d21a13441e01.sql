-- Create form chains table to manage multi-page form workflows
CREATE TABLE public.form_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  status form_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on form_chains
ALTER TABLE public.form_chains ENABLE ROW LEVEL SECURITY;

-- Create policies for form_chains
CREATE POLICY "Users can create their own form chains"
ON public.form_chains
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own form chains"
ON public.form_chains
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own form chains"
ON public.form_chains
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own form chains"
ON public.form_chains
FOR DELETE
USING (auth.uid() = owner_id);

-- Add form chain relationship columns to forms table
ALTER TABLE public.forms 
ADD COLUMN chain_id UUID REFERENCES public.form_chains(id) ON DELETE CASCADE,
ADD COLUMN page_order INTEGER DEFAULT 0,
ADD COLUMN is_chain_root BOOLEAN DEFAULT false;

-- Create form transitions table for conditional routing
CREATE TABLE public.form_transitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  to_form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
  condition_field_id UUID,
  condition_operator TEXT DEFAULT 'always',
  condition_value TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on form_transitions
ALTER TABLE public.form_transitions ENABLE ROW LEVEL SECURITY;

-- Create policies for form_transitions
CREATE POLICY "Users can manage transitions of their forms"
ON public.form_transitions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = form_transitions.from_form_id 
    AND forms.owner_id = auth.uid()
  )
);

-- Update partial_submissions to support chain workflows
ALTER TABLE public.partial_submissions
ADD COLUMN chain_id UUID REFERENCES public.form_chains(id) ON DELETE CASCADE,
ADD COLUMN current_form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
ADD COLUMN chain_progress JSONB DEFAULT '{}';

-- Create trigger for form_chains updated_at
CREATE TRIGGER update_form_chains_updated_at
BEFORE UPDATE ON public.form_chains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_forms_chain_id ON public.forms(chain_id);
CREATE INDEX idx_forms_page_order ON public.forms(chain_id, page_order);
CREATE INDEX idx_form_transitions_from_form ON public.form_transitions(from_form_id);