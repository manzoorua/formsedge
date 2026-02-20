import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BillingStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  failedPayments: number;
  subscribers: Array<{
    id: string;
    email: string;
    subscription_tier: string;
    subscription_status: string;
    subscription_end: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
    user_id: string;
  }>;
  webhookEvents: Array<{
    id: string;
    event_type: string;
    created_at: string;
    data: any;
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

    console.log('[ADMIN-BILLING-STATS] Fetching billing data for admin:', user.email);

    // Fetch all subscribers
    const { data: subscribers, error: subsError } = await supabase
      .from('subscribers')
      .select('id, user_id, email, subscription_tier, subscription_status, subscription_end, cancel_at_period_end, created_at, subscribed')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('[ADMIN-BILLING-STATS] Error fetching subscribers:', subsError);
      throw subsError;
    }

    // Calculate revenue metrics
    const tierPrices: Record<string, number> = {
      'free': 0,
      'pro': 29,
      'enterprise': 99,
    };

    let totalRevenue = 0;
    let monthlyRecurringRevenue = 0;
    let annualRecurringRevenue = 0;
    let activeSubscriptions = 0;
    let canceledSubscriptions = 0;

    subscribers?.forEach((sub) => {
      const price = tierPrices[sub.subscription_tier || 'free'] || 0;
      
      if (sub.subscribed && sub.subscription_status === 'active') {
        activeSubscriptions++;
        monthlyRecurringRevenue += price;
        annualRecurringRevenue += price * 12;
      } else if (sub.subscription_status === 'canceled' || sub.cancel_at_period_end) {
        canceledSubscriptions++;
      }
      
      totalRevenue += price; // Simplified - in production, calculate based on billing history
    });

    // Get recent webhook events (if you have a billing_events table)
    // For now, return empty array - you can add this table later
    const webhookEvents: any[] = [];

    // Count failed payments (simplified - you'd track this in a payments table)
    const failedPayments = 0;

    const stats: BillingStats = {
      totalRevenue,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      activeSubscriptions,
      canceledSubscriptions,
      failedPayments,
      subscribers: subscribers || [],
      webhookEvents,
    };

    console.log('[ADMIN-BILLING-STATS] Successfully calculated billing stats');

    return new Response(
      JSON.stringify(stats),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[ADMIN-BILLING-STATS] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to fetch billing statistics' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
