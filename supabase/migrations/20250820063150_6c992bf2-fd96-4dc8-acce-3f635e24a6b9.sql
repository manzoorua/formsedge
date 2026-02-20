-- Create enum types
CREATE TYPE public.form_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.field_type AS ENUM ('text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'file', 'date', 'rating', 'slider');
CREATE TYPE public.team_role AS ENUM ('viewer', 'editor', 'admin');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  subscription_plan subscription_plan DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create forms table
CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status form_status DEFAULT 'draft',
  is_public BOOLEAN DEFAULT true,
  custom_url TEXT UNIQUE,
  branding_enabled BOOLEAN DEFAULT false,
  branding_logo_url TEXT,
  branding_color TEXT,
  notification_email TEXT,
  collect_emails BOOLEAN DEFAULT false,
  limit_responses BOOLEAN DEFAULT false,
  max_responses INTEGER,
  accept_responses BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form fields table
CREATE TABLE public.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type field_type NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  placeholder TEXT,
  required BOOLEAN DEFAULT false,
  options JSONB, -- For select/radio/checkbox options
  validation_rules JSONB, -- Validation settings
  logic_conditions JSONB, -- Conditional logic
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form responses table
CREATE TABLE public.form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  respondent_email TEXT,
  is_partial BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form response answers table
CREATE TABLE public.form_response_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.form_responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  value TEXT,
  file_urls JSONB, -- For file upload fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form templates table
CREATE TABLE public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  template_data JSONB NOT NULL, -- Form structure and fields
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role team_role DEFAULT 'viewer',
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(form_id, user_id)
);

-- Create form analytics table
CREATE TABLE public.form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  drop_off_rate DECIMAL(5,2) DEFAULT 0,
  avg_completion_time INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, date)
);

-- Create file uploads table
CREATE TABLE public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.form_responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.form_fields(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid recursive RLS issues
CREATE OR REPLACE FUNCTION public.get_user_role_for_form(form_id UUID, user_id UUID)
RETURNS team_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.team_members 
  WHERE team_members.form_id = $1 AND team_members.user_id = $2 AND accepted_at IS NOT NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_form_owner(form_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.forms 
    WHERE id = $1 AND owner_id = $2
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_form(form_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    public.is_form_owner($1, $2) OR 
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.form_id = $1 AND team_members.user_id = $2 AND accepted_at IS NOT NULL
    );
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Forms RLS policies
CREATE POLICY "Users can view their own forms" ON public.forms
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shared forms" ON public.forms
  FOR SELECT USING (
    public.can_access_form(id, auth.uid())
  );

CREATE POLICY "Users can view public forms for submissions" ON public.forms
  FOR SELECT USING (is_public = true AND status = 'published');

CREATE POLICY "Users can create their own forms" ON public.forms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own forms" ON public.forms
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Team members can update shared forms" ON public.forms
  FOR UPDATE USING (
    public.get_user_role_for_form(id, auth.uid()) IN ('editor', 'admin')
  );

CREATE POLICY "Users can delete their own forms" ON public.forms
  FOR DELETE USING (auth.uid() = owner_id);

-- Form fields RLS policies
CREATE POLICY "Users can view fields of accessible forms" ON public.form_fields
  FOR SELECT USING (
    public.can_access_form(form_id, auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.forms WHERE id = form_id AND is_public = true AND status = 'published')
  );

CREATE POLICY "Users can manage fields of their forms" ON public.form_fields
  FOR ALL USING (
    public.is_form_owner(form_id, auth.uid()) OR
    public.get_user_role_for_form(form_id, auth.uid()) IN ('editor', 'admin')
  );

-- Form responses RLS policies
CREATE POLICY "Form owners can view all responses" ON public.form_responses
  FOR SELECT USING (
    public.is_form_owner(form_id, auth.uid()) OR
    public.get_user_role_for_form(form_id, auth.uid()) IS NOT NULL
  );

CREATE POLICY "Users can view their own responses" ON public.form_responses
  FOR SELECT USING (auth.uid() = respondent_id);

CREATE POLICY "Anyone can submit to public forms" ON public.form_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE id = form_id AND is_public = true AND status = 'published' AND accept_responses = true
    )
  );

CREATE POLICY "Users can update their own responses" ON public.form_responses
  FOR UPDATE USING (auth.uid() = respondent_id);

-- Form response answers RLS policies
CREATE POLICY "Users can view answers through responses" ON public.form_response_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.form_responses 
      WHERE id = response_id AND (
        public.is_form_owner(form_id, auth.uid()) OR
        public.get_user_role_for_form(form_id, auth.uid()) IS NOT NULL OR
        auth.uid() = respondent_id
      )
    )
  );

CREATE POLICY "Users can insert answers to accessible responses" ON public.form_response_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.form_responses 
      WHERE id = response_id AND (
        auth.uid() = respondent_id OR
        EXISTS (
          SELECT 1 FROM public.forms 
          WHERE id = form_id AND is_public = true AND status = 'published' AND accept_responses = true
        )
      )
    )
  );

-- Form templates RLS policies (public read access)
CREATE POLICY "Anyone can view form templates" ON public.form_templates
  FOR SELECT USING (true);

-- Team members RLS policies
CREATE POLICY "Users can view team members of accessible forms" ON public.team_members
  FOR SELECT USING (
    public.is_form_owner(form_id, auth.uid()) OR
    auth.uid() = user_id
  );

CREATE POLICY "Form owners can manage team members" ON public.team_members
  FOR ALL USING (public.is_form_owner(form_id, auth.uid()));

CREATE POLICY "Users can accept team invitations" ON public.team_members
  FOR UPDATE USING (auth.uid() = user_id AND accepted_at IS NULL);

-- Form analytics RLS policies
CREATE POLICY "Users can view analytics of accessible forms" ON public.form_analytics
  FOR SELECT USING (
    public.is_form_owner(form_id, auth.uid()) OR
    public.get_user_role_for_form(form_id, auth.uid()) IS NOT NULL
  );

CREATE POLICY "System can insert analytics" ON public.form_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON public.form_analytics
  FOR UPDATE USING (true);

-- File uploads RLS policies
CREATE POLICY "Users can view files from accessible responses" ON public.file_uploads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.form_responses fr
      JOIN public.forms f ON fr.form_id = f.id
      WHERE fr.id = response_id AND (
        f.owner_id = auth.uid() OR
        fr.respondent_id = auth.uid() OR
        public.get_user_role_for_form(f.id, auth.uid()) IS NOT NULL
      )
    )
  );

CREATE POLICY "Users can upload files to their responses" ON public.file_uploads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.form_responses 
      WHERE id = response_id AND (
        respondent_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.forms 
          WHERE id = form_id AND is_public = true AND status = 'published' AND accept_responses = true
        )
      )
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at
  BEFORE UPDATE ON public.form_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_forms_owner_id ON public.forms(owner_id);
CREATE INDEX idx_forms_status ON public.forms(status);
CREATE INDEX idx_forms_custom_url ON public.forms(custom_url);
CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);
CREATE INDEX idx_form_fields_order ON public.form_fields(form_id, order_index);
CREATE INDEX idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX idx_form_responses_respondent_id ON public.form_responses(respondent_id);
CREATE INDEX idx_form_response_answers_response_id ON public.form_response_answers(response_id);
CREATE INDEX idx_team_members_form_id ON public.team_members(form_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_form_analytics_form_id ON public.form_analytics(form_id);
CREATE INDEX idx_form_analytics_date ON public.form_analytics(date);
CREATE INDEX idx_file_uploads_response_id ON public.file_uploads(response_id);