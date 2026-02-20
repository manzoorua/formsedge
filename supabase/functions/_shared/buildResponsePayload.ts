import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import {
  FormsEdgeResponsePayload,
  FormsEdgeAnswer,
  FormsEdgeResponseMetadata,
  FormsEdgeFieldType
} from './types.ts';

/**
 * Builds the canonical FormsEdge response payload from database records
 * Used by both Responses API and Webhook dispatcher
 */
export async function buildResponsePayload(
  supabase: SupabaseClient,
  responseId: string
): Promise<FormsEdgeResponsePayload | null> {
  try {
    // 1. Load response with form details
    const { data: response, error: responseError } = await supabase
      .from('form_responses')
      .select(`
        id,
        form_id,
        respondent_id,
        respondent_email,
        is_partial,
        submitted_at,
        created_at,
        url_params,
        forms (
          id,
          title
        )
      `)
      .eq('id', responseId)
      .single();

    if (responseError || !response) {
      console.error('Response not found:', responseError);
      return null;
    }

    // 2. Load answers with field metadata
    const { data: answers, error: answersError } = await supabase
      .from('form_response_answers')
      .select(`
        id,
        field_id,
        value,
        file_urls,
        form_fields (
          id,
          label,
          type
        )
      `)
      .eq('response_id', responseId);

    if (answersError) {
      console.error('Error loading answers:', answersError);
      return null;
    }

    // 3. Transform answers to canonical format
    const formattedAnswers: FormsEdgeAnswer[] = (answers || [])
      .filter(a => a.form_fields)
      .map(answer => {
        const field = Array.isArray(answer.form_fields) 
          ? answer.form_fields[0] 
          : answer.form_fields;
        
        let parsedValue = answer.value;
        
        // Parse JSON strings for certain field types
        if (typeof parsedValue === 'string') {
          try {
            if (parsedValue.startsWith('[') || parsedValue.startsWith('{')) {
              parsedValue = JSON.parse(parsedValue);
            }
          } catch {
            // Keep as string if parsing fails
          }
        }

        const formattedAnswer: FormsEdgeAnswer = {
          field: {
            id: field.id,
            label: field.label,
            type: field.type as FormsEdgeFieldType,
            ref: null
          },
          type: field.type as FormsEdgeFieldType,
          value: parsedValue
        };

        if (answer.file_urls && Array.isArray(answer.file_urls)) {
          formattedAnswer.file_urls = answer.file_urls;
        }

        return formattedAnswer;
      });

    // 4. Calculate completion time
    const metadata: FormsEdgeResponseMetadata = {};
    
    if (response.submitted_at && response.created_at) {
      const completionSeconds = Math.floor(
        (new Date(response.submitted_at).getTime() - new Date(response.created_at).getTime()) / 1000
      );
      metadata.completion_time_seconds = completionSeconds;
      
      if (completionSeconds < 60) {
        metadata.completion_time_label = 'Less than 1 minute';
      } else if (completionSeconds < 300) {
        metadata.completion_time_label = `${Math.floor(completionSeconds / 60)} minutes`;
      } else if (completionSeconds < 3600) {
        metadata.completion_time_label = `${Math.floor(completionSeconds / 60)} minutes`;
      } else {
        metadata.completion_time_label = `${Math.floor(completionSeconds / 3600)} hours`;
      }
    }

    // 5. Build final payload
    const payload: FormsEdgeResponsePayload = {
      id: response.id,
      form_id: response.form_id,
      form_title: response.forms.title,
      status: response.is_partial ? 'partial' : 'complete',
      respondent_id: response.respondent_id,
      respondent_email: response.respondent_email,
      created_at: response.created_at,
      submitted_at: response.submitted_at,
      url_params: response.url_params || {},
      metadata,
      answers: formattedAnswers
    };

    return payload;

  } catch (error) {
    console.error('Error building response payload:', error);
    return null;
  }
}
