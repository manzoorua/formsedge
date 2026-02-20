import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { buildResponsePayload } from '../_shared/buildResponsePayload.ts';
import {
  FormsEdgeListResponsesResult,
  FormsEdgeSingleResponseResult,
  FormsEdgeErrorResponse
} from '../_shared/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'unauthorized',
            message: 'Missing authorization header'
          }
        } as FormsEdgeErrorResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'unauthorized',
            message: 'Invalid or expired token'
          }
        } as FormsEdgeErrorResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);

    // Route: GET /form-responses/{response_id}
    if (req.method === 'GET' && pathParts.length === 2) {
      const responseId = pathParts[1];
      
      console.log(`[form-responses] Fetching single response: ${responseId}`);

      const payload = await buildResponsePayload(supabase, responseId);
      
      if (!payload) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'not_found',
              message: 'Response not found or access denied'
            }
          } as FormsEdgeErrorResponse),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result: FormsEdgeSingleResponseResult = { item: payload };
      
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /form-responses?form_id=...
    if (req.method === 'GET' && pathParts.length === 1) {
      const formId = url.searchParams.get('form_id');
      const status = url.searchParams.get('status') || 'complete';
      const pageSize = Math.min(parseInt(url.searchParams.get('page_size') || '50'), 200);
      const cursor = url.searchParams.get('cursor');
      const since = url.searchParams.get('since');
      const until = url.searchParams.get('until');

      if (!formId) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'bad_request',
              message: 'Missing required parameter: form_id'
            }
          } as FormsEdgeErrorResponse),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[form-responses] Listing responses for form: ${formId}`);

      const { data: hasAccess } = await supabase
        .rpc('can_access_form', { form_id: formId, user_id: user.id });

      if (!hasAccess) {
        return new Response(
          JSON.stringify({
            error: {
              code: 'forbidden',
              message: 'Access denied to this form'
            }
          } as FormsEdgeErrorResponse),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let query = supabase
        .from('form_responses')
        .select('id, created_at, submitted_at, is_partial', { count: 'exact' })
        .eq('form_id', formId);

      if (status === 'complete') {
        query = query.eq('is_partial', false);
      } else if (status === 'partial') {
        query = query.eq('is_partial', true);
      }

      if (since) {
        query = query.gte('submitted_at', since);
      }
      if (until) {
        query = query.lte('submitted_at', until);
      }

      if (cursor) {
        try {
          const decoded = JSON.parse(atob(cursor));
          query = query
            .or(`submitted_at.gt.${decoded.submitted_at},and(submitted_at.eq.${decoded.submitted_at},id.gt.${decoded.id})`);
        } catch (e) {
          console.error('Invalid cursor:', e);
        }
      }

      query = query
        .order('submitted_at', { ascending: true })
        .order('id', { ascending: true })
        .limit(pageSize + 1);

      const { data: responses, error: queryError, count } = await query;

      if (queryError) {
        console.error('Query error:', queryError);
        return new Response(
          JSON.stringify({
            error: {
              code: 'internal_error',
              message: 'Failed to fetch responses'
            }
          } as FormsEdgeErrorResponse),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hasMore = (responses?.length || 0) > pageSize;
      const items = responses?.slice(0, pageSize) || [];

      const payloads = await Promise.all(
        items.map(r => buildResponsePayload(supabase, r.id))
      );

      const validPayloads = payloads.filter(p => p !== null);

      let nextCursor: string | null = null;
      if (hasMore && items.length > 0) {
        const lastItem = items[items.length - 1];
        nextCursor = btoa(JSON.stringify({
          submitted_at: lastItem.submitted_at,
          id: lastItem.id
        }));
      }

      const result: FormsEdgeListResponsesResult = {
        items: validPayloads,
        total_count: count || 0,
        page_size: pageSize,
        next_cursor: nextCursor,
        has_more: hasMore
      };

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: 'not_found',
          message: 'Endpoint not found'
        }
      } as FormsEdgeErrorResponse),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'internal_error',
          message: error.message || 'An unexpected error occurred'
        }
      } as FormsEdgeErrorResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
