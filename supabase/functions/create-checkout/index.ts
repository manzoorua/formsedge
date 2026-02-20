import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Rate limiting and security validation
async function validateRequest(req: Request, supabase: any) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Check rate limit - max 5 checkout attempts per hour per IP
  const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
    ip_addr: clientIP,
    endpoint_name: 'create-checkout',
    max_requests: 5,
    window_minutes: 60
  });
  
  if (!rateLimitCheck) {
    // Log security event
    await supabase.rpc('log_security_event', {
      event_type_param: 'rate_limit_exceeded',
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      endpoint_param: 'create-checkout',
      risk_level_param: 'high'
    });
    
    throw new Error('Rate limit exceeded');
  }
  
  return { clientIP, userAgent };
}

// Input validation
function validatePlan(plan: string): boolean {
  const validPlans = ['free', 'pro', 'enterprise'];
  return validPlans.includes(plan.toLowerCase());
}

function validateBillingInterval(interval: string): boolean {
  return ['monthly', 'yearly'].includes(interval);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use anon key for auth, service role for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Validate request and check rate limits
    const { clientIP, userAgent } = await validateRequest(req, supabaseServiceRole);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { plan, billing_interval = "monthly" } = body;
    
    if (!plan) throw new Error("Plan is required");
    
    // Validate input
    if (!validatePlan(plan)) {
      await supabaseServiceRole.rpc('log_security_event', {
        event_type_param: 'invalid_plan_parameter',
        user_id_param: user.id,
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'create-checkout',
        payload_param: { plan },
        risk_level_param: 'medium'
      });
      
      throw new Error("Invalid plan specified");
    }
    
    if (!validateBillingInterval(billing_interval)) {
      await supabaseServiceRole.rpc('log_security_event', {
        event_type_param: 'invalid_billing_interval',
        user_id_param: user.id,
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'create-checkout',
        payload_param: { billing_interval },
        risk_level_param: 'low'
      });
      
      throw new Error("Invalid billing interval");
    }
    
    logStep("Request body parsed and validated", { plan, billing_interval });

    // Get subscription tier details using the secure view
    const { data: tierData, error: tierError } = await supabaseServiceRole
      .from("public_subscription_tiers")
      .select("*")
      .eq("name", plan)
      .single();
    
    if (tierError || !tierData) {
      throw new Error(`Invalid plan: ${plan}`);
    }
    logStep("Subscription tier found", tierData);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session
    const price = billing_interval === "yearly" ? tierData.price_yearly : tierData.price_monthly;
    
    // Use price data dynamically for security (avoid exposing price IDs)
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tierData.name.charAt(0).toUpperCase() + tierData.name.slice(1)} Plan`,
            description: tierData.description,
          },
          unit_amount: price,
          recurring: { interval: billing_interval },
        },
        quantity: 1,
      },
    ];

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "subscription",
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      metadata: {
        user_id: user.id,
        plan: plan,
        billing_interval: billing_interval
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Log successful checkout creation
    await supabaseServiceRole.rpc('log_security_event', {
      event_type_param: 'successful_checkout_creation',
      user_id_param: user.id,
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      endpoint_param: 'create-checkout',
      payload_param: { plan, billing_interval, sessionId: session.id },
      risk_level_param: 'low'
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    // Log security event for errors
    try {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const supabaseServiceRole = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseServiceRole.rpc('log_security_event', {
        event_type_param: 'checkout_creation_error',
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'create-checkout',
        payload_param: { error: errorMessage },
        risk_level_param: 'medium'
      });
    } catch (logError) {
      console.log('Failed to log security event:', logError);
    }
    
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});