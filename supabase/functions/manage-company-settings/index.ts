import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: 'get' | 'update';
  settings?: {
    address_line1?: string;
    address_line2?: string;
    city_state_zip?: string;
    country?: string;
    sales_phone?: string;
    support_phone?: string;
    emergency_phone?: string;
    general_email?: string;
    sales_email?: string;
    support_email?: string;
    business_hours?: string;
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();

    // For 'get' action, no auth required (public data)
    if (body.action === 'get') {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ settings: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For 'update', require admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === 'update') {
      if (!body.settings) {
        return new Response(
          JSON.stringify({ error: "settings required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get current settings ID
      const { data: current } = await supabase
        .from("company_settings")
        .select("id")
        .limit(1)
        .single();

      if (!current) {
        return new Response(
          JSON.stringify({ error: "No settings found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("company_settings")
        .update({
          ...body.settings,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        action_name: 'update_company_settings',
        target_table_name: 'company_settings',
        target_record_id: current.id,
        new_data: body.settings
      });

      return new Response(
        JSON.stringify({ settings: data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in manage-company-settings:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
