import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache for settings (5 minutes TTL)
let settingsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check cache first
    const now = Date.now();
    if (settingsCache && (now - settingsCache.timestamp) < CACHE_TTL) {
      return new Response(
        JSON.stringify({ settings: settingsCache.data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all active settings
    const { data: settings, error } = await supabaseClient
      .from('referral_settings')
      .select('setting_key, setting_value')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Transform to key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, any>);

    // Update cache
    settingsCache = {
      data: settingsObj,
      timestamp: now
    };

    return new Response(
      JSON.stringify({ settings: settingsObj }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching referral settings:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while fetching referral settings' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});