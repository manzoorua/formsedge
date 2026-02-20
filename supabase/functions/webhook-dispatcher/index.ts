import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { buildResponsePayload } from '../_shared/buildResponsePayload.ts';
import { generateHmacSignature } from '../_shared/hmac.ts';
import { FormsEdgeWebhookEvent } from '../_shared/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DispatchRequest {
  formId: string;
  responseId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { formId, responseId }: DispatchRequest = await req.json();

    console.log(`[webhook-dispatcher] Processing form ${formId}, response ${responseId}`);

    const { data: integrations, error: integrationsError } = await supabase
      .from('form_integrations')
      .select('*')
      .eq('form_id', formId)
      .in('integration_type', ['webhook', 'n8n', 'zapier'])
      .eq('is_active', true);

    if (integrationsError) {
      console.error('Error fetching integrations:', integrationsError);
      throw integrationsError;
    }

    if (!integrations || integrations.length === 0) {
      console.log('[webhook-dispatcher] No active webhook integrations found');
      return new Response(
        JSON.stringify({ success: true, message: 'No webhooks to dispatch' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responsePayload = await buildResponsePayload(supabase, responseId);
    
    if (!responsePayload) {
      console.error('[webhook-dispatcher] Failed to build response payload');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to build payload' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await Promise.allSettled(
      integrations.map(async (integration) => {
        const webhookUrl = integration.configuration?.webhook_url || integration.configuration?.url;
        const webhookSecret = integration.configuration?.secret;

        if (!webhookUrl) {
          console.error(`[webhook-dispatcher] No URL configured for integration ${integration.id}`);
          return;
        }

        const eventId = crypto.randomUUID();
        const event: FormsEdgeWebhookEvent = {
          event_id: eventId,
          event_type: 'form_response',
          created_at: new Date().toISOString(),
          form_response: responsePayload
        };

        const body = JSON.stringify(event);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'FormsEdge-Webhook/1.0'
        };

        if (webhookSecret) {
          const signature = await generateHmacSignature(webhookSecret, body);
          headers['X-FormsEdge-Signature'] = signature;
        }

        const { data: logEntry } = await supabase
          .from('webhook_delivery_logs')
          .insert({
            form_id: formId,
            integration_id: integration.id,
            response_id: responseId,
            event_id: eventId,
            event_type: 'form_response',
            status: 'pending',
            attempt: 1,
            url: webhookUrl,
            request_body: event
          })
          .select()
          .single();

        try {
          console.log(`[webhook-dispatcher] Sending webhook to ${webhookUrl}`);

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body,
            signal: AbortSignal.timeout(30000)
          });

          const responseText = await response.text().catch(() => '');

          await supabase
            .from('webhook_delivery_logs')
            .update({
              status: response.ok ? 'success' : 'failed',
              http_status: response.status,
              error_message: response.ok ? null : `HTTP ${response.status}`,
              response_body: responseText.substring(0, 5000),
              updated_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);

          await supabase
            .from('form_integrations')
            .update({
              last_triggered_at: new Date().toISOString(),
              status: response.ok ? 'connected' : 'error',
              last_error: response.ok ? null : `HTTP ${response.status}`
            })
            .eq('id', integration.id);

          if (!response.ok) {
            console.error(`[webhook-dispatcher] Webhook failed: HTTP ${response.status}`);
            throw new Error(`Webhook returned HTTP ${response.status}`);
          }

          console.log(`[webhook-dispatcher] Webhook delivered successfully`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[webhook-dispatcher] Error sending webhook:`, errorMessage);

          await supabase
            .from('webhook_delivery_logs')
            .update({
              status: 'failed',
              error_message: errorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);

          await supabase
            .from('form_integrations')
            .update({
              status: 'error',
              last_error: errorMessage
            })
            .eq('id', integration.id);

          throw error;
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`[webhook-dispatcher] Completed: ${successCount} success, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        dispatched: integrations.length,
        succeeded: successCount,
        failed: failureCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[webhook-dispatcher] Unhandled error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
