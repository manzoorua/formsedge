import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tier limits for organization members
const TIER_LIMITS: Record<string, number> = {
  free: 0,
  pro: 3,
  enterprise: 10,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check user's subscription tier
    const { data: subscriber } = await supabaseAdmin
      .from('subscribers')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    const userTier = subscriber?.subscription_tier || 'free';
    const tierLimit = TIER_LIMITS[userTier] ?? 0;

    // Check if user is admin (unlimited access)
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isAdmin = !!adminUser;
    const effectiveLimit = isAdmin ? -1 : tierLimit;

    // Block free tier users from organization features
    if (effectiveLimit === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Organization features require a Pro or Enterprise subscription',
          code: 'SUBSCRIPTION_REQUIRED'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, role, formId, orgId } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!formId && !orgId) {
      return new Response(
        JSON.stringify({ error: 'Either formId or orgId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check member limits for organization invitations
    if (orgId && effectiveLimit !== -1) {
      const { count: memberCount } = await supabaseAdmin
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId);

      const { count: pendingCount } = await supabaseAdmin
        .from('team_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      const totalMembers = (memberCount || 0) + (pendingCount || 0);

      if (totalMembers >= effectiveLimit) {
        return new Response(
          JSON.stringify({ 
            error: `Organization member limit reached (${effectiveLimit} members for ${userTier} plan)`,
            code: 'MEMBER_LIMIT_REACHED',
            currentCount: totalMembers,
            limit: effectiveLimit,
            tier: userTier
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate form permissions
    if (formId) {
      const { data: form, error: formError } = await supabaseAdmin
        .from('forms')
        .select('owner_id, org_id')
        .eq('id', formId)
        .single();

      if (formError || !form) {
        return new Response(
          JSON.stringify({ error: 'Form not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isOwner = form.owner_id === user.id;
      let hasTeamAccess = false;
      if (!isOwner) {
        const { data: teamMember } = await supabaseAdmin
          .from('team_members')
          .select('role')
          .eq('form_id', formId)
          .eq('user_id', user.id)
          .single();
        hasTeamAccess = teamMember?.role === 'admin';
      }

      if (!isOwner && !hasTeamAccess) {
        return new Response(
          JSON.stringify({ error: 'You do not have permission to invite members to this form' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate org permissions
    if (orgId) {
      const { data: orgMember } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null)
        .single();

      if (!orgMember || !['owner', 'admin'].includes(orgMember.role)) {
        return new Response(
          JSON.stringify({ error: 'You do not have permission to invite members to this organization' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check existing member
    if (formId) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        const { data: existingMember } = await supabaseAdmin
          .from('team_members')
          .select('id')
          .eq('form_id', formId)
          .eq('user_id', existingProfile.id)
          .single();

        if (existingMember) {
          return new Response(
            JSON.stringify({ error: 'This user is already a team member' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Check existing invitation
    const { data: existingInvitation } = await supabaseAdmin
      .from('team_invitations')
      .select('id')
      .eq('email', email)
      .eq(formId ? 'form_id' : 'org_id', formId || orgId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: 'An invitation has already been sent to this email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .insert({
        email,
        role: role || 'viewer',
        form_id: formId || null,
        org_id: orgId || null,
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Invitation created: ${invitation.id} for ${email} by ${user.id} (tier: ${userTier})`);

    return new Response(
      JSON.stringify({
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          token: invitation.token,
          expires_at: invitation.expires_at,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in invite-team-member:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
