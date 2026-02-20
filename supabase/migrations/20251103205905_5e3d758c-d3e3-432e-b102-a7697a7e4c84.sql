-- Create user support notes table
CREATE TABLE IF NOT EXISTS public.user_support_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_support_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can read support notes
CREATE POLICY "Admins can view all support notes"
ON public.user_support_notes
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can create support notes
CREATE POLICY "Admins can create support notes"
ON public.user_support_notes
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update support notes
CREATE POLICY "Admins can update support notes"
ON public.user_support_notes
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Only admins can delete support notes
CREATE POLICY "Admins can delete support notes"
ON public.user_support_notes
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_user_support_notes_updated_at
BEFORE UPDATE ON public.user_support_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_support_notes_user_id ON public.user_support_notes(user_id);
CREATE INDEX idx_user_support_notes_created_at ON public.user_support_notes(created_at DESC);