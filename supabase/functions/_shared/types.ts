/**
 * Canonical response types for FormsEdge API & Webhooks
 * Aligned with Typeform-style response format
 */

export type FormsEdgeFieldType = 
  | 'text' | 'email' | 'phone' | 'number' | 'date' | 'time'
  | 'textarea' | 'checkbox' | 'radio' | 'select' | 'multiselect'
  | 'file' | 'signature' | 'rating' | 'slider' | 'matrix'
  | 'divider' | 'html' | 'pagebreak' | 'section' | 'calculated';

export interface FormsEdgeField {
  id: string;
  label: string;
  type: FormsEdgeFieldType;
  ref?: string | null;
}

export interface FormsEdgeAnswer {
  field: FormsEdgeField;
  type: FormsEdgeFieldType;
  value: any;
  file_urls?: string[];
}

export interface FormsEdgeResponseMetadata {
  completion_time_seconds?: number;
  completion_time_label?: string;
  user_agent?: string;
  ip_address?: string;
  referer?: string;
}

export interface FormsEdgeResponsePayload {
  id: string;
  form_id: string;
  form_title: string;
  status: 'complete' | 'partial';
  respondent_id: string | null;
  respondent_email: string | null;
  created_at: string;
  submitted_at: string | null;
  url_params: Record<string, string>;
  metadata: FormsEdgeResponseMetadata;
  answers: FormsEdgeAnswer[];
}

export interface FormsEdgeWebhookEvent {
  event_id: string;
  event_type: 'form_response';
  created_at: string;
  form_response: FormsEdgeResponsePayload;
}

export interface FormsEdgeListResponsesResult {
  items: FormsEdgeResponsePayload[];
  total_count: number;
  page_size: number;
  next_cursor: string | null;
  has_more: boolean;
}

export interface FormsEdgeSingleResponseResult {
  item: FormsEdgeResponsePayload;
}

export interface FormsEdgeErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
