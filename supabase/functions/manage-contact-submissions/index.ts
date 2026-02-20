import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: 'list' | 'get_details' | 'update_status' | 'add_note' | 'delete_note' | 'export_csv';
  submission_id?: string;
  filters?: {
    status?: string;
    inquiry_type?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  };
  update_data?: {
    status?: string;
    priority?: string;
    assigned_to?: string | null;
  };
  note_data?: {
    note: string;
    is_internal?: boolean;
  };
  note_id?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { user_id: user.id });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    console.log("Admin action:", body.action, "by user:", user.id);

    switch (body.action) {
      case 'list': {
        let query = supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (body.filters?.status && body.filters.status !== 'all') {
          query = query.eq("status", body.filters.status);
        }
        if (body.filters?.inquiry_type && body.filters.inquiry_type !== 'all') {
          query = query.eq("inquiry_type", body.filters.inquiry_type);
        }
        if (body.filters?.search) {
          query = query.or(`full_name.ilike.%${body.filters.search}%,email.ilike.%${body.filters.search}%,subject.ilike.%${body.filters.search}%`);
        }
        if (body.filters?.date_from) {
          query = query.gte("created_at", body.filters.date_from);
        }
        if (body.filters?.date_to) {
          query = query.lte("created_at", body.filters.date_to);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Get counts by status
        const { data: allSubmissions } = await supabase
          .from("contact_submissions")
          .select("status");
        
        const counts = {
          total: allSubmissions?.length || 0,
          new: allSubmissions?.filter(s => s.status === 'new').length || 0,
          in_progress: allSubmissions?.filter(s => s.status === 'in_progress').length || 0,
          resolved: allSubmissions?.filter(s => s.status === 'resolved').length || 0,
          closed: allSubmissions?.filter(s => s.status === 'closed').length || 0,
        };

        return new Response(
          JSON.stringify({ submissions: data, counts }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'get_details': {
        if (!body.submission_id) {
          return new Response(
            JSON.stringify({ error: "submission_id required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: submission, error: submissionError } = await supabase
          .from("contact_submissions")
          .select("*")
          .eq("id", body.submission_id)
          .single();

        if (submissionError) throw submissionError;

        const { data: notes, error: notesError } = await supabase
          .from("contact_submission_notes")
          .select("*")
          .eq("submission_id", body.submission_id)
          .order("created_at", { ascending: false });

        if (notesError) throw notesError;

        return new Response(
          JSON.stringify({ submission, notes }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'update_status': {
        if (!body.submission_id || !body.update_data) {
          return new Response(
            JSON.stringify({ error: "submission_id and update_data required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("contact_submissions")
          .update({
            ...body.update_data,
            updated_at: new Date().toISOString()
          })
          .eq("id", body.submission_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ submission: data }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'add_note': {
        if (!body.submission_id || !body.note_data?.note) {
          return new Response(
            JSON.stringify({ error: "submission_id and note required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("contact_submission_notes")
          .insert({
            submission_id: body.submission_id,
            admin_id: user.id,
            note: body.note_data.note,
            is_internal: body.note_data.is_internal ?? true
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ note: data }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'delete_note': {
        if (!body.note_id) {
          return new Response(
            JSON.stringify({ error: "note_id required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("contact_submission_notes")
          .delete()
          .eq("id", body.note_id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case 'export_csv': {
        let query = supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (body.filters?.status && body.filters.status !== 'all') {
          query = query.eq("status", body.filters.status);
        }
        if (body.filters?.inquiry_type && body.filters.inquiry_type !== 'all') {
          query = query.eq("inquiry_type", body.filters.inquiry_type);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Generate CSV
        const headers = ["ID", "Type", "Name", "Email", "Company", "Phone", "Subject", "Message", "Status", "Priority", "Created"];
        const rows = data?.map(s => [
          s.id,
          s.inquiry_type,
          s.full_name,
          s.email,
          s.company || '',
          s.phone || '',
          s.subject,
          s.message.replace(/"/g, '""'),
          s.status,
          s.priority,
          s.created_at
        ]) || [];

        const csv = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return new Response(csv, {
          status: 200,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=contact_submissions.csv"
          }
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("Error in manage-contact-submissions:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
