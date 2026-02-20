-- Create form edit locks table for multi-instance coordination
CREATE TABLE public.form_edit_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL,
  user_id UUID NOT NULL,
  instance_id TEXT NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.form_edit_locks ENABLE ROW LEVEL SECURITY;

-- Create policies for form edit locks
CREATE POLICY "Users can view locks for forms they can access" 
ON public.form_edit_locks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = form_edit_locks.form_id 
    AND (
      forms.owner_id = auth.uid() 
      OR public.get_user_role_for_form(forms.id, auth.uid()) IS NOT NULL
    )
  )
);

CREATE POLICY "Users can create locks for accessible forms" 
ON public.form_edit_locks 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = form_edit_locks.form_id 
    AND (
      forms.owner_id = auth.uid() 
      OR public.get_user_role_for_form(forms.id, auth.uid()) = ANY (ARRAY['editor'::team_role, 'admin'::team_role])
    )
  )
);

CREATE POLICY "Users can update their own locks" 
ON public.form_edit_locks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locks" 
ON public.form_edit_locks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_form_edit_locks_form_id ON public.form_edit_locks(form_id);
CREATE INDEX idx_form_edit_locks_user_id ON public.form_edit_locks(user_id);
CREATE INDEX idx_form_edit_locks_expires_at ON public.form_edit_locks(expires_at);

-- Create function to clean up expired locks
CREATE OR REPLACE FUNCTION public.cleanup_expired_form_locks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.form_edit_locks
  WHERE expires_at < now();
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_form_edit_locks_updated_at
BEFORE UPDATE ON public.form_edit_locks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for form edit locks
ALTER PUBLICATION supabase_realtime ADD TABLE public.form_edit_locks;