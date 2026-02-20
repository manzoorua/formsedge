-- Phase 2: Organization Foundation Database Schema

-- Organization role enum (separate from existing team_role)
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member', 'billing_admin');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  settings JSONB DEFAULT '{}',
  stripe_customer_id TEXT,
  billing_email TEXT
);

-- Organization members table (roles stored separately per security guidelines)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Add org_id to existing tables (nullable for backward compatibility)
ALTER TABLE public.forms ADD COLUMN org_id UUID REFERENCES public.organizations(id);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_forms_org_id ON public.forms(org_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(org_id);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- Security Definer Functions to prevent RLS recursion

-- Check if user has specific role(s) in organization
CREATE OR REPLACE FUNCTION public.has_org_role(
  _user_id UUID, 
  _org_id UUID, 
  _roles org_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND role = ANY(_roles)
      AND accepted_at IS NOT NULL
  );
$$;

-- Check if user can access organization (is a member)
CREATE OR REPLACE FUNCTION public.can_access_org(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = _org_id 
      AND user_id = _user_id 
      AND accepted_at IS NOT NULL
  );
$$;

-- Get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id UUID)
RETURNS TABLE(org_id UUID, org_name TEXT, org_slug TEXT, role org_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.name, o.slug, om.role
  FROM public.organizations o
  JOIN public.organization_members om ON o.id = om.org_id
  WHERE om.user_id = _user_id AND om.accepted_at IS NOT NULL;
$$;

-- RLS Policies for Organizations

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (can_access_org(id, auth.uid()));

-- Org owners/admins can update organization
CREATE POLICY "Org admins can update organization"
ON public.organizations FOR UPDATE
USING (has_org_role(auth.uid(), id, ARRAY['owner', 'admin']::org_role[]));

-- Authenticated users can create organizations
CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Org owners can delete organizations
CREATE POLICY "Org owners can delete organization"
ON public.organizations FOR DELETE
USING (has_org_role(auth.uid(), id, ARRAY['owner']::org_role[]));

-- RLS Policies for Organization Members

-- Users can view members of their organizations
CREATE POLICY "Users can view org members"
ON public.organization_members FOR SELECT
USING (can_access_org(org_id, auth.uid()) OR user_id = auth.uid());

-- Org admins can manage members
CREATE POLICY "Org admins can insert members"
ON public.organization_members FOR INSERT
WITH CHECK (
  has_org_role(auth.uid(), org_id, ARRAY['owner', 'admin']::org_role[])
  OR (user_id = auth.uid() AND NOT EXISTS (SELECT 1 FROM organization_members WHERE org_id = organization_members.org_id))
);

CREATE POLICY "Org admins can update members"
ON public.organization_members FOR UPDATE
USING (
  has_org_role(auth.uid(), org_id, ARRAY['owner', 'admin']::org_role[])
  OR (user_id = auth.uid() AND accepted_at IS NULL)
);

CREATE POLICY "Org admins can delete members"
ON public.organization_members FOR DELETE
USING (has_org_role(auth.uid(), org_id, ARRAY['owner', 'admin']::org_role[]));

-- Update forms RLS to include org access
CREATE POLICY "Users can view org forms"
ON public.forms FOR SELECT
USING (org_id IS NOT NULL AND can_access_org(org_id, auth.uid()));

CREATE POLICY "Org members can update org forms"
ON public.forms FOR UPDATE
USING (
  org_id IS NOT NULL 
  AND has_org_role(auth.uid(), org_id, ARRAY['owner', 'admin', 'member']::org_role[])
);

-- Add team_invitations table for pending invitations
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT invitation_target CHECK (form_id IS NOT NULL OR org_id IS NOT NULL)
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);

-- RLS for team_invitations
CREATE POLICY "Form owners can manage form invitations"
ON public.team_invitations FOR ALL
USING (
  (form_id IS NOT NULL AND is_form_owner(form_id, auth.uid()))
  OR (org_id IS NOT NULL AND has_org_role(auth.uid(), org_id, ARRAY['owner', 'admin']::org_role[]))
);

CREATE POLICY "Users can view their invitations"
ON public.team_invitations FOR SELECT
USING (email = auth.email());

-- Update trigger for organizations
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();