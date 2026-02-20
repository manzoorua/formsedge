import { supabase } from '@/integrations/supabase/client';
import { validateWebhookUrl } from '@/lib/webhookValidation';

interface FormSubmissionData {
  formId: string;
  responseId: string;
  submissionData: Record<string, any>;
  respondentEmail?: string;
  urlParams?: Record<string, string>;
}

export const useIntegrationTrigger = () => {
  const triggerIntegrations = async (data: FormSubmissionData) => {
    try {
      // Get all active integrations for this form
      const { data: integrations, error } = await supabase
        .from('form_integrations')
        .select('*')
        .eq('form_id', data.formId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching integrations:', error);
        return;
      }

      // Separate webhook and non-webhook integrations
      const webhookIntegrations = integrations.filter(
        i => i.integration_type === 'webhook' || i.integration_type === 'n8n' || i.integration_type === 'zapier'
      );
      const otherIntegrations = integrations.filter(
        i => i.integration_type !== 'webhook' && i.integration_type !== 'n8n' && i.integration_type !== 'zapier'
      );

      // For webhook integrations, call the server-side dispatcher
      if (webhookIntegrations.length > 0) {
        console.log('[useIntegrationTrigger] Dispatching webhooks via edge function');
        
        try {
          const { error: dispatchError } = await supabase.functions.invoke('webhook-dispatcher', {
            body: {
              formId: data.formId,
              responseId: data.responseId
            }
          });

          if (dispatchError) {
            console.error('[useIntegrationTrigger] Webhook dispatch error:', dispatchError);
          }
        } catch (dispatchError) {
          console.error('[useIntegrationTrigger] Failed to invoke webhook dispatcher:', dispatchError);
        }
      }

      // Handle other integration types (email, etc.)
      const otherPromises = otherIntegrations.map(async (integration) => {
        try {
          await triggerSingleIntegration(integration, data);
          
          await supabase
            .from('form_integrations')
            .update({ 
              last_triggered_at: new Date().toISOString(),
              status: 'connected',
              last_error: null
            })
            .eq('id', integration.id);
            
        } catch (error) {
          console.error(`Error triggering ${integration.name}:`, error);
          
          await supabase
            .from('form_integrations')
            .update({ 
              status: 'error',
              last_error: error instanceof Error ? error.message : 'Unknown error'
            })
            .eq('id', integration.id);
        }
      });

      await Promise.allSettled(otherPromises);
    } catch (error) {
      console.error('Error triggering integrations:', error);
    }
  };

  const triggerSingleIntegration = async (integration: any, data: FormSubmissionData) => {
    const payload = {
      formId: data.formId,
      responseId: data.responseId,
      submissionData: data.submissionData,
      respondentEmail: data.respondentEmail,
      url_params: data.urlParams,
      timestamp: new Date().toISOString(),
      integrationName: integration.name
    };

    switch (integration.integration_type) {
      case 'email':
        // Placeholder for email integration
        console.log('Email integration triggered:', payload);
        break;

      default:
        console.log(`Integration type ${integration.integration_type} not implemented yet`);
    }
  };

  return { triggerIntegrations };
};