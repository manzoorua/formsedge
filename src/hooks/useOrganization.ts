import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './useSubscription';

export type OrgRole = 'owner' | 'admin' | 'member' | 'billing_admin';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  settings?: Record<string, any>;
  stripe_customer_id?: string;
  billing_email?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  org_id: string;
  org_name: string;
  org_slug: string;
  role: OrgRole;
}

const ORG_STORAGE_KEY = 'formsedge_current_org';

export function useOrganization() {
  const { user } = useAuth();
  const { limits, canAddOrgMember, getOrgMemberLimitMessage } = useSubscription();
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [currentOrg, setCurrentOrg] = useState<OrganizationMembership | null>(null);
  const [currentOrgDetails, setCurrentOrgDetails] = useState<Organization | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's organizations
  const fetchOrganizations = useCallback(async () => {
    if (!user?.id) {
      setOrganizations([]);
      setCurrentOrg(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .rpc('get_user_organizations', { _user_id: user.id });

      if (fetchError) throw fetchError;

      const orgs: OrganizationMembership[] = (data || []).map((org: any) => ({
        org_id: org.org_id,
        org_name: org.org_name,
        org_slug: org.org_slug,
        role: org.role as OrgRole,
      }));

      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem(ORG_STORAGE_KEY);
      const savedOrg = orgs.find(o => o.org_id === savedOrgId);
      
      if (savedOrg) {
        setCurrentOrg(savedOrg);
      } else if (orgs.length > 0) {
        setCurrentOrg(orgs[0]);
        localStorage.setItem(ORG_STORAGE_KEY, orgs[0].org_id);
      } else {
        setCurrentOrg(null);
        localStorage.removeItem(ORG_STORAGE_KEY);
      }
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch full details of current organization
  const fetchOrgDetails = useCallback(async () => {
    if (!currentOrg?.org_id) {
      setCurrentOrgDetails(null);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', currentOrg.org_id)
        .single();

      if (fetchError) throw fetchError;
      setCurrentOrgDetails(data as Organization);
    } catch (err: any) {
      console.error('Error fetching org details:', err);
    }
  }, [currentOrg?.org_id]);

  // Fetch member count for current org
  const fetchMemberCount = useCallback(async () => {
    if (!currentOrg?.org_id) {
      setMemberCount(0);
      return;
    }

    try {
      const { count: members } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', currentOrg.org_id);

      const { count: pending } = await supabase
        .from('team_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', currentOrg.org_id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      setMemberCount((members || 0) + (pending || 0));
    } catch (err) {
      console.error('Error fetching member count:', err);
    }
  }, [currentOrg?.org_id]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    fetchOrgDetails();
    fetchMemberCount();
  }, [fetchOrgDetails, fetchMemberCount]);

  // Switch to a different organization
  const switchOrganization = useCallback((orgId: string) => {
    const org = organizations.find(o => o.org_id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem(ORG_STORAGE_KEY, orgId);
    }
  }, [organizations]);

  // Create a new organization
  const createOrganization = useCallback(async (name: string, slug?: string): Promise<Organization | null> => {
    if (!user?.id) return null;

    // Check subscription tier
    if (!limits.canUseOrganizations) {
      throw new Error('Organization features require a Pro or Enterprise subscription');
    }

    try {
      const orgSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          slug: orgSlug,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      await fetchOrganizations();
      return org as Organization;
    } catch (err: any) {
      console.error('Error creating organization:', err);
      setError(err.message);
      return null;
    }
  }, [user?.id, limits.canUseOrganizations, fetchOrganizations]);

  // Check if user has specific role(s) in current org
  const hasOrgRole = useCallback((roles: OrgRole | OrgRole[]): boolean => {
    if (!currentOrg) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(currentOrg.role);
  }, [currentOrg]);

  // Check if can invite more members
  const canInviteMore = useCallback((): boolean => {
    return canAddOrgMember(memberCount);
  }, [canAddOrgMember, memberCount]);

  // Get member limit message
  const getMemberLimitMessage = useCallback((): string => {
    return getOrgMemberLimitMessage(memberCount);
  }, [getOrgMemberLimitMessage, memberCount]);

  // Convenience methods
  const isOrgOwner = useCallback(() => hasOrgRole('owner'), [hasOrgRole]);
  const isOrgAdmin = useCallback(() => hasOrgRole(['owner', 'admin']), [hasOrgRole]);
  const canManageMembers = useCallback(() => hasOrgRole(['owner', 'admin']), [hasOrgRole]);
  const canManageBilling = useCallback(() => hasOrgRole(['owner', 'billing_admin']), [hasOrgRole]);

  return {
    organizations,
    currentOrg,
    currentOrgDetails,
    memberCount,
    maxMembers: limits.maxOrgMembers,
    switchOrganization,
    createOrganization,
    hasOrgRole,
    canInviteMore,
    getMemberLimitMessage,
    isOrgOwner,
    isOrgAdmin,
    canManageMembers,
    canManageBilling,
    canUseOrganizations: limits.canUseOrganizations,
    loading,
    error,
    refetch: fetchOrganizations,
    refreshMemberCount: fetchMemberCount,
  };
}
