import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Rate limiting and security validation
async function validateRequest(req: Request, supabase: any) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Check rate limit - max 10 referral code generations per hour per IP
  const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
    ip_addr: clientIP,
    endpoint_name: 'generate-referral-code',
    max_requests: 10,
    window_minutes: 60
  });
  
  if (!rateLimitCheck) {
    // Log security event
    await supabase.rpc('log_security_event', {
      event_type_param: 'rate_limit_exceeded',
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      endpoint_param: 'generate-referral-code',
      risk_level_param: 'high'
    });
    
    throw new Error('Rate limit exceeded');
  }
  
  return { clientIP, userAgent };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting referral code generation...');
    
    // Create authenticated Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Use service role client for rate limiting and logging
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate request and check rate limits
    const { clientIP, userAgent } = await validateRequest(req, serviceClient);

    // Get authenticated user using Supabase's built-in method
    console.log('Getting authenticated user...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      await serviceClient.rpc('log_security_event', {
        event_type_param: 'unauthorized_referral_generation',
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'generate-referral-code',
        risk_level_param: 'medium'
      });
      
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', code: 'AUTH_FAILED' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const userId = user.id;
    console.log('User authenticated successfully:', userId);

    // Check if user already has an active referral code
    console.log('Checking for existing referral codes...');
    const { data: existingCode, error: fetchError } = await serviceClient
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing code:', fetchError);
      return new Response(
        JSON.stringify({ error: 'An error occurred while checking referral codes', code: 'DB_FETCH_ERROR' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    if (existingCode) {
      console.log('Found existing referral code:', existingCode.code);
      return new Response(
        JSON.stringify({ code: existingCode.code, url: `${req.headers.get('origin')}/auth?ref=${existingCode.code}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new referral code
    console.log('Generating new referral code...');
    let code = generateReferralCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existingCodeCheck } = await serviceClient
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .single();

      if (!existingCodeCheck) break;
      
      code = generateReferralCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.error('Unable to generate unique referral code after', maxAttempts, 'attempts');
      throw new Error('Unable to generate unique referral code');
    }

    // Create new referral code
    console.log('Creating new referral code with user_id:', userId);
    const { data: newCode, error: insertError } = await serviceClient
      .from('referral_codes')
      .insert({
        user_id: userId,
        code: code,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting new referral code:', insertError);
      return new Response(
        JSON.stringify({ error: 'An error occurred while creating referral code', code: 'DB_INSERT_ERROR' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('Successfully created referral code:', newCode.code);

    // Log successful code generation
    await serviceClient.rpc('log_security_event', {
      event_type_param: 'successful_referral_code_generation',
      user_id_param: userId,
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      endpoint_param: 'generate-referral-code',
      payload_param: { code: newCode.code },
      risk_level_param: 'low'
    });

    return new Response(
      JSON.stringify({ 
        code: newCode.code, 
        url: `${req.headers.get('origin')}/auth?ref=${newCode.code}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error generating referral code:', error);
    
    // Log security event for errors
    try {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await serviceClient.rpc('log_security_event', {
        event_type_param: 'referral_generation_error',
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'generate-referral-code',
        payload_param: { error: error.message },
        risk_level_param: 'medium'
      });
    } catch (logError) {
      console.log('Failed to log security event:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred. Please try again.', 
        code: 'INTERNAL_ERROR'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});