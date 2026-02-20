import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserDetails {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end: string | null;
  total_forms: number;
  total_responses: number;
  support_notes: Array<{
    id: string;
    note: string;
    priority: string;
    created_at: string;
    admin_email: string | null;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin status
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action, userId, noteData, searchQuery, noteId, targetUserId, role, adminUserId } = body;

    console.log('[ADMIN-USER-MANAGEMENT] Action:', action, 'by admin:', user.email);

    // Handle different actions
    switch (action) {
      case 'search': {
        // Search users by email or name
        let query = supabase
          .from('profiles')
          .select('id, email, first_name, last_name, created_at, subscription_plan')
          .order('created_at', { ascending: false })
          .limit(100);

        if (searchQuery && searchQuery.trim()) {
          const search = searchQuery.trim().toLowerCase();
          query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
        }

        const { data: profiles, error: profilesError } = await query;

        if (profilesError) {
          console.error('[ADMIN-USER-MANAGEMENT] Error fetching profiles:', profilesError);
          throw profilesError;
        }

        // Get subscription data for each user
        const usersWithDetails = await Promise.all(
          (profiles || []).map(async (profile) => {
            const [subscriberData, formsCount, responsesCount] = await Promise.all([
              supabase
                .from('subscribers')
                .select('subscription_tier, subscription_status, subscription_end')
                .eq('user_id', profile.id)
                .maybeSingle(),
              supabase
                .from('forms')
                .select('id', { count: 'exact', head: true })
                .eq('owner_id', profile.id),
              supabase
                .from('form_responses')
                .select('id', { count: 'exact', head: true })
                .eq('respondent_id', profile.id),
            ]);

            return {
              ...profile,
              subscription_tier: subscriberData.data?.subscription_tier || profile.subscription_plan || 'free',
              subscription_status: subscriberData.data?.subscription_status || 'inactive',
              subscription_end: subscriberData.data?.subscription_end || null,
              total_forms: formsCount.count || 0,
              total_responses: responsesCount.count || 0,
            };
          })
        );

        return new Response(
          JSON.stringify({ users: usersWithDetails }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_user_details': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'userId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch subscription data
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscription_tier, subscription_status, subscription_end')
          .eq('user_id', userId)
          .maybeSingle();

        // Fetch activity stats
        const [formsCount, responsesCount, supportNotesData] = await Promise.all([
          supabase
            .from('forms')
            .select('id', { count: 'exact', head: true })
            .eq('owner_id', userId),
          supabase
            .from('form_responses')
            .select('id', { count: 'exact', head: true })
            .eq('respondent_id', userId),
          supabase
            .from('user_support_notes')
            .select('id, note, priority, created_at, admin_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        ]);

        // Get admin emails for support notes
        const notesWithAdminEmails = await Promise.all(
          (supportNotesData.data || []).map(async (note) => {
            const { data: adminProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', note.admin_id)
              .single();

            return {
              ...note,
              admin_email: adminProfile?.email || 'Unknown',
            };
          })
        );

        const userDetails: UserDetails = {
          ...profile,
          subscription_tier: subscriber?.subscription_tier || profile.subscription_plan || 'free',
          subscription_status: subscriber?.subscription_status || 'inactive',
          subscription_end: subscriber?.subscription_end || null,
          total_forms: formsCount.count || 0,
          total_responses: responsesCount.count || 0,
          support_notes: notesWithAdminEmails,
        };

        return new Response(
          JSON.stringify({ user: userDetails }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add_support_note': {
        if (!userId || !noteData) {
          return new Response(
            JSON.stringify({ error: 'userId and noteData are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: newNote, error: noteError } = await supabase
          .from('user_support_notes')
          .insert({
            user_id: userId,
            admin_id: user.id,
            note: noteData.note,
            priority: noteData.priority || 'low',
          })
          .select()
          .single();

        if (noteError) {
          console.error('[ADMIN-USER-MANAGEMENT] Error creating note:', noteError);
          throw noteError;
        }

        console.log('[ADMIN-USER-MANAGEMENT] Support note created for user:', userId);

        return new Response(
          JSON.stringify({ note: newNote }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete_support_note': {
        if (!noteId) {
          return new Response(
            JSON.stringify({ error: 'noteId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: deleteError } = await supabase
          .from('user_support_notes')
          .delete()
          .eq('id', noteId);

        if (deleteError) {
          console.error('[ADMIN-USER-MANAGEMENT] Error deleting note:', deleteError);
          throw deleteError;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list_admins': {
        // Fetch all admin users with their profile information
        const { data: adminUsers, error: adminUsersError } = await supabase
          .from('admin_users')
          .select('id, user_id, role, created_at')
          .order('created_at', { ascending: false });

        if (adminUsersError) {
          console.error('[ADMIN-USER-MANAGEMENT] Error fetching admin users:', adminUsersError);
          throw adminUsersError;
        }

        // Get profile data for each admin
        const adminsWithProfiles = await Promise.all(
          (adminUsers || []).map(async (admin) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', admin.user_id)
              .single();

            return {
              id: admin.id,
              user_id: admin.user_id,
              email: profile?.email || 'Unknown',
              first_name: profile?.first_name || null,
              last_name: profile?.last_name || null,
              role: admin.role,
              created_at: admin.created_at,
            };
          })
        );

        return new Response(
          JSON.stringify({ admins: adminsWithProfiles }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'promote_to_admin': {
        if (!targetUserId || !role) {
          return new Response(
            JSON.stringify({ error: 'targetUserId and role are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate role
        if (!['admin', 'moderator'].includes(role)) {
          return new Response(
            JSON.stringify({ error: 'Invalid role. Must be admin or moderator' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if user is already an admin
        const { data: existingAdmin } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (existingAdmin) {
          return new Response(
            JSON.stringify({ error: 'User is already an administrator' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Set permissions based on role
        const permissions = role === 'admin' 
          ? { referral_settings: true, user_management: true, system_admin: true }
          : { referral_settings: true };

        // Add admin user
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            user_id: targetUserId,
            role: role,
            permissions: permissions,
            created_by: user.id,
          });

        if (insertError) {
          console.error('[ADMIN-USER-MANAGEMENT] Error promoting user:', insertError);
          throw insertError;
        }

        console.log('[ADMIN-USER-MANAGEMENT] User promoted to', role, ':', targetUserId);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'remove_admin': {
        if (!adminUserId) {
          return new Response(
            JSON.stringify({ error: 'adminUserId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if this is the last admin
        const { count } = await supabase
          .from('admin_users')
          .select('id', { count: 'exact', head: true });

        if (count && count <= 1) {
          return new Response(
            JSON.stringify({ error: 'Cannot remove the last administrator' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Remove admin
        const { error: deleteError } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', adminUserId);

        if (deleteError) {
          console.error('[ADMIN-USER-MANAGEMENT] Error removing admin:', deleteError);
          throw deleteError;
        }

        console.log('[ADMIN-USER-MANAGEMENT] Admin removed:', adminUserId);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('[ADMIN-USER-MANAGEMENT] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to process user management request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
