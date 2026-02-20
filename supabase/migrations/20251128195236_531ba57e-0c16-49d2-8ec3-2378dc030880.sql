-- Add max_org_members column to subscription_tiers
ALTER TABLE public.subscription_tiers 
ADD COLUMN IF NOT EXISTS max_org_members integer DEFAULT 0;

-- Update tier limits
UPDATE public.subscription_tiers SET max_org_members = 0 WHERE name = 'free';
UPDATE public.subscription_tiers SET max_org_members = 3 WHERE name = 'pro';
UPDATE public.subscription_tiers SET max_org_members = 10 WHERE name = 'enterprise';

-- Create function to get user's max org members limit
CREATE OR REPLACE FUNCTION public.get_user_org_member_limit(user_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT st.max_org_members 
     FROM subscribers s 
     JOIN subscription_tiers st ON s.subscription_tier = st.name
     WHERE s.user_id = user_id_param
     LIMIT 1),
    0
  );
$$;

-- Create function to count org members (including pending invitations)
CREATE OR REPLACE FUNCTION public.count_org_members(org_id_param uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    (SELECT COUNT(*)::integer FROM organization_members WHERE org_id = org_id_param)
    +
    (SELECT COUNT(*)::integer FROM team_invitations 
     WHERE org_id = org_id_param 
     AND accepted_at IS NULL 
     AND expires_at > now())
  );
$$;