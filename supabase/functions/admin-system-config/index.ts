import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { action, configKey, configValue, category, tierId, tierData } = await req.json();

    console.log('[ADMIN-SYSTEM-CONFIG] Action:', action, 'by admin:', user.email);

    switch (action) {
      case 'get_all': {
        // Fetch all system configuration
        const { data: configs, error: configError } = await supabase
          .from('system_config')
          .select('*')
          .order('category', { ascending: true })
          .order('config_key', { ascending: true });

        if (configError) {
          console.error('[ADMIN-SYSTEM-CONFIG] Error fetching configs:', configError);
          throw configError;
        }

        return new Response(
          JSON.stringify({ configs: configs || [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_by_category': {
        if (!category) {
          return new Response(
            JSON.stringify({ error: 'category is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: configs, error: configError } = await supabase
          .from('system_config')
          .select('*')
          .eq('category', category)
          .order('config_key', { ascending: true });

        if (configError) {
          console.error('[ADMIN-SYSTEM-CONFIG] Error fetching configs:', configError);
          throw configError;
        }

        return new Response(
          JSON.stringify({ configs: configs || [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!configKey || !configValue) {
          return new Response(
            JSON.stringify({ error: 'configKey and configValue are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update configuration
        const { data: updatedConfig, error: updateError } = await supabase
          .from('system_config')
          .update({
            config_value: configValue,
            updated_by: user.id,
          })
          .eq('config_key', configKey)
          .select()
          .single();

        if (updateError) {
          console.error('[ADMIN-SYSTEM-CONFIG] Error updating config:', updateError);
          throw updateError;
        }

        console.log('[ADMIN-SYSTEM-CONFIG] Config updated:', configKey);

        return new Response(
          JSON.stringify({ config: updatedConfig }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_audit_log': {
        if (!configKey) {
          return new Response(
            JSON.stringify({ error: 'configKey is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get configuration ID
        const { data: config } = await supabase
          .from('system_config')
          .select('id')
          .eq('config_key', configKey)
          .single();

        if (!config) {
          return new Response(
            JSON.stringify({ error: 'Configuration not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch audit logs
        const { data: auditLogs, error: auditError } = await supabase
          .from('system_config_audit')
          .select('id, old_value, new_value, changed_by, changed_at')
          .eq('config_id', config.id)
          .order('changed_at', { ascending: false })
          .limit(50);

        if (auditError) {
          console.error('[ADMIN-SYSTEM-CONFIG] Error fetching audit logs:', auditError);
          throw auditError;
        }

        // Get admin emails for each change
        const logsWithEmails = await Promise.all(
          (auditLogs || []).map(async (log) => {
            const { data: adminProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', log.changed_by)
              .single();

            return {
              ...log,
              changed_by_email: adminProfile?.email || 'Unknown',
            };
          })
        );

        return new Response(
          JSON.stringify({ audit_logs: logsWithEmails }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_pricing_tiers': {
        const { data: tiers, error: tiersError } = await supabase
          .from('subscription_tiers')
          .select('*')
          .order('sort_order', { ascending: true });

        if (tiersError) {
          console.error('[ADMIN-SYSTEM-CONFIG] Error fetching pricing tiers:', tiersError);
          throw tiersError;
        }

        return new Response(
          JSON.stringify({ tiers: tiers || [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_pricing_tier': {
        if (!tierId || !tierData) {
          return new Response(
            JSON.stringify({ error: 'tierId and tierData are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get current tier data for audit
        const { data: currentTier } = await supabase
          .from('subscription_tiers')
          .select('*')
          .eq('id', tierId)
          .single();

        // Update the tier
        const { data: updatedTier, error: updateError } = await supabase
          .from('subscription_tiers')
          .update({
            price_monthly: tierData.price_monthly,
            price_yearly: tierData.price_yearly,
            stripe_price_id_monthly: tierData.stripe_price_id_monthly,
            stripe_price_id_yearly: tierData.stripe_price_id_yearly,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tierId)
          .select()
          .single();

        if (updateError) {
          console.error('[ADMIN-SYSTEM-CONFIG] Error updating pricing tier:', updateError);
          throw updateError;
        }

        // Log the change to admin audit
        await supabase.from('admin_audit_log').insert({
          admin_user_id: user.id,
          action: 'update_pricing_tier',
          target_table: 'subscription_tiers',
          target_id: tierId,
          old_values: currentTier,
          new_values: updatedTier,
        });

        console.log('[ADMIN-SYSTEM-CONFIG] Pricing tier updated:', updatedTier.name);

        return new Response(
          JSON.stringify({ tier: updatedTier }),
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
    console.error('[ADMIN-SYSTEM-CONFIG] Error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
