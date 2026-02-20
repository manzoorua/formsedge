-- Create company_settings table for dynamic contact info
CREATE TABLE public.company_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address_line1 text DEFAULT 'Westridge Offices Ste: 197',
  address_line2 text DEFAULT '1300 Walnut Hill Ln.',
  city_state_zip text DEFAULT 'Irving, TX 75038',
  country text DEFAULT 'US',
  sales_phone text DEFAULT '+1(214) 997-3572',
  support_phone text DEFAULT '+1(214) 997-3572',
  emergency_phone text DEFAULT '+1(214) 997-3572',
  general_email text DEFAULT 'info@FormsEdge.com',
  sales_email text DEFAULT 'sales@FormsEdge.com',
  support_email text DEFAULT 'support@FormsEdge.com',
  business_hours text DEFAULT 'Monday - Friday: 9:00 AM - 6:00 PM CST',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Public can read company settings
CREATE POLICY "Anyone can read company settings"
ON public.company_settings FOR SELECT
USING (true);

-- Only admins can update company settings
CREATE POLICY "Admins can update company settings"
ON public.company_settings FOR UPDATE
USING (check_is_admin(auth.uid()));

-- Only admins can insert (for initial setup)
CREATE POLICY "Admins can insert company settings"
ON public.company_settings FOR INSERT
WITH CHECK (check_is_admin(auth.uid()));

-- Insert default row
INSERT INTO public.company_settings (id) VALUES (gen_random_uuid());

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('general', 'sales', 'support', 'partnership')),
  full_name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form)
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read contact submissions"
ON public.contact_submissions FOR SELECT
USING (check_is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions FOR UPDATE
USING (check_is_admin(auth.uid()));

-- Only admins can delete
CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions FOR DELETE
USING (check_is_admin(auth.uid()));

-- Create contact_submission_notes table
CREATE TABLE public.contact_submission_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL,
  note text NOT NULL,
  is_internal boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submission_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage notes
CREATE POLICY "Admins can manage submission notes"
ON public.contact_submission_notes FOR ALL
USING (check_is_admin(auth.uid()));

-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid, -- null means for all admins
  type text NOT NULL DEFAULT 'contact_submission',
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can read their notifications (or global ones)
CREATE POLICY "Admins can read their notifications"
ON public.admin_notifications FOR SELECT
USING (check_is_admin(auth.uid()) AND (admin_id IS NULL OR admin_id = auth.uid()));

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.admin_notifications FOR INSERT
WITH CHECK (true);

-- Admins can update their notifications (mark as read)
CREATE POLICY "Admins can update their notifications"
ON public.admin_notifications FOR UPDATE
USING (check_is_admin(auth.uid()) AND (admin_id IS NULL OR admin_id = auth.uid()));

-- Enable realtime for contact_submissions
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;

-- Create trigger for updated_at on contact_submissions
CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on company_settings
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();