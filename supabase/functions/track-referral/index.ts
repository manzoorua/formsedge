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

// Rate limiting and security validation
async function validateRequest(req: Request, supabase: any) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Check rate limit
  const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
    ip_addr: clientIP,
    endpoint_name: 'track-referral',
    max_requests: 50, // 50 requests per hour
    window_minutes: 60
  });
  
  if (!rateLimitCheck) {
    // Log security event
    await supabase.rpc('log_security_event', {
      event_type_param: 'rate_limit_exceeded',
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      endpoint_param: 'track-referral',
      risk_level_param: 'medium'
    });
    
    throw new Error('Rate limit exceeded');
  }
  
  return { clientIP, userAgent };
}

// Input validation
function validateReferralCode(code: string): boolean {
  // Referral codes should be 8 alphanumeric characters
  const codeRegex = /^[A-Za-z0-9]{8}$/;
  return codeRegex.test(code);
}

function validateUserId(userId: string): boolean {
  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate request and check rate limits
    const { clientIP, userAgent } = await validateRequest(req, supabaseClient);
    
    const body = await req.json();
    const { referralCode, newUserId } = body;

    if (!referralCode || !newUserId) {
      return new Response(
        JSON.stringify({ error: 'Referral code and new user ID are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate referral code format
    if (!validateReferralCode(referralCode)) {
      await supabaseClient.rpc('log_security_event', {
        event_type_param: 'invalid_referral_code_format',
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'track-referral',
        payload_param: { referralCode },
        risk_level_param: 'low'
      });
      
      return new Response(
        JSON.stringify({ error: 'Invalid referral code format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate user ID format
    if (!validateUserId(newUserId)) {
      await supabaseClient.rpc('log_security_event', {
        event_type_param: 'invalid_user_id_format',
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'track-referral',
        payload_param: { newUserId },
        risk_level_param: 'medium'
      });
      
      return new Response(
        JSON.stringify({ error: 'Invalid user ID format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find the referral code
    const { data: referralCodeData, error: codeError } = await supabaseClient
      .from('referral_codes')
      .select('*')
      .eq('code', referralCode)
      .eq('is_active', true)
      .single();

    if (codeError || !referralCodeData) {
      throw new Error('Invalid or inactive referral code');
    }

    // Check if the new user is the same as the referrer
    if (referralCodeData.user_id === newUserId) {
      throw new Error('Users cannot refer themselves');
    }

    // Check if user has already been referred
    const { data: existingReferral } = await supabaseClient
      .from('referrals')
      .select('id')
      .eq('referred_id', newUserId)
      .single();

    if (existingReferral) {
      throw new Error('User has already been referred');
    }

    // Get current referral bonus amount from settings
    const { data: bonusSettings } = await supabaseClient
      .from('referral_settings')
      .select('setting_value')
      .eq('setting_key', 'referral_bonus_amount')
      .eq('is_active', true)
      .single();

    const bonusAmount = bonusSettings?.setting_value?.value || 25.00;

    // Create referral record
    const { data: referral, error: referralError } = await supabaseClient
      .from('referrals')
      .insert({
        referrer_id: referralCodeData.user_id,
        referred_id: newUserId,
        referral_code_id: referralCodeData.id,
        status: 'completed',
        reward_earned: bonusAmount,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (referralError) {
      throw referralError;
    }

    // Update referral code usage count
    await supabaseClient
      .from('referral_codes')
      .update({ 
        current_uses: referralCodeData.current_uses + 1 
      })
      .eq('id', referralCodeData.id);

    // Create reward record
    await supabaseClient
      .from('referral_rewards')
      .insert({
        user_id: referralCodeData.user_id,
        referral_id: referral.id,
        amount: bonusAmount,
        status: 'pending'
      });

    // Log successful referral
    await supabaseClient.rpc('log_security_event', {
      event_type_param: 'successful_referral_tracking',
      user_id_param: newUserId,
      ip_address_param: clientIP,
      user_agent_param: userAgent,
      endpoint_param: 'track-referral',
      payload_param: { referralCode, referrerId: referralCodeData.user_id },
      risk_level_param: 'low'
    });

    return new Response(
      JSON.stringify({ success: true, referral }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error tracking referral:', error);
    
    // Log security event for errors
    try {
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient.rpc('log_security_event', {
        event_type_param: 'referral_tracking_error',
        ip_address_param: clientIP,
        user_agent_param: userAgent,
        endpoint_param: 'track-referral',
        payload_param: { error: error.message },
        risk_level_param: 'medium'
      });
    } catch (logError) {
      console.log('Failed to log security event:', logError);
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});