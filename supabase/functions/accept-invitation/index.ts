import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This invitation has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email matches
    if (user.email !== invitation.email) {
      return new Response(
        JSON.stringify({ 
          error: `This invitation was sent to ${invitation.email}. Please sign in with that email address.` 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process invitation based on type
    if (invitation.form_id) {
      // Add user as team member to form
      const { error: memberError } = await supabaseAdmin
        .from('team_members')
        .insert({
          form_id: invitation.form_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          accepted_at: new Date().toISOString(),
        });

      if (memberError) {
        // Check if already a member
        if (memberError.code === '23505') { // Unique violation
          console.log('User is already a team member');
        } else {
          console.error('Error adding team member:', memberError);
          return new Response(
            JSON.stringify({ error: 'Failed to add team member' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    if (invitation.org_id) {
      // Add user as organization member
      const { error: orgMemberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
          org_id: invitation.org_id,
          user_id: user.id,
          role: 'member', // Default to member for org invitations
          invited_by: invitation.invited_by,
          accepted_at: new Date().toISOString(),
        });

      if (orgMemberError) {
        // Check if already a member
        if (orgMemberError.code === '23505') { // Unique violation
          console.log('User is already an organization member');
        } else {
          console.error('Error adding org member:', orgMemberError);
          return new Response(
            JSON.stringify({ error: 'Failed to add organization member' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabaseAdmin
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
    }

    console.log(`Invitation ${invitation.id} accepted by ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        formId: invitation.form_id,
        orgId: invitation.org_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in accept-invitation:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
