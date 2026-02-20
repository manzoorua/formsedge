export type FieldType = 
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'multiselect'
  | 'file'
  | 'signature'
  | 'rating'
  | 'slider'
  | 'matrix'
  | 'divider'
  | 'html'
  | 'pagebreak'
  | 'section'
  | 'calculated';

export interface FormField {
  id: string;
  form_id?: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: any; // JSON field for select/radio/checkbox options
  validation_rules?: any; // JSON field for validation
  logic_conditions?: any; // JSON field for conditional logic
  conditional_logic?: any; // JSON field for show/hide logic
  calculations?: any; // JSON field for calculations
  styling?: any; // JSON field for custom styling
  order_index: number;
  created_at?: string;
  ref?: string; // Stable reference for Recall tokens (e.g., "full_name", "company")
  // Layout properties
  width?: 'full' | 'half' | 'quarter'; // Field width
  row?: number; // Row index for grid layout
  column?: number; // Column index within row
  alignment?: 'left' | 'center' | 'right';
}

export interface FormUrlParamConfig {
  name: string;
  label?: string;
  description?: string;
  include_in_responses?: boolean;
  visible_in_exports?: boolean;
  default_value?: string | null;
  transitive_default?: boolean;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  is_public: boolean;
  accept_responses: boolean;
  owner_id: string;
  
  
  // Branding & Design
  theme_id?: string;
  custom_css?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  
  // Form Settings
  enable_partial_save: boolean;
  auto_save_interval: number;
  
  thank_you_message: string;
  redirect_url?: string;
  webhook_url?: string;
  enable_analytics: boolean;
  
  // URL Parameters & Hidden Data
  url_params_config?: FormUrlParamConfig[];
  
  // Legacy fields
  branding_enabled?: boolean;
  collect_emails?: boolean;
  limit_responses?: boolean;
  max_responses?: number;
  custom_url?: string;
  branding_logo_url?: string;
  branding_color?: string;
  notification_email?: string;
  
  created_at: string;
  updated_at: string;
  
  // Layout and Background properties
  layout?: {
    columns: number; // Number of columns (1-4)
    grid_gap: string; // Gap between fields
    responsive: boolean; // Auto-stack on mobile
  };
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string; // Color hex, gradient CSS, or image URL
    opacity?: number; // For overlay on images
    position?: string; // Background position for images
    size?: string; // Background size for images
  };
}

export interface FormTransition {
  id: string;
  from_form_id: string;
  to_form_id?: string;
  is_default: boolean;
  created_at: string;
}

export interface FormTheme {
  id: string;
  name: string;
  description?: string;
  theme_data: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    fontFamily: string;
    buttonStyle: 'solid' | 'outline' | 'ghost' | 'gradient';
    inputStyle: 'bordered' | 'minimal' | 'filled';
  };
  is_default: boolean;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PartialSubmission {
  id: string;
  form_id: string;
  session_id: string;
  respondent_id?: string;
  data: Record<string, any>;
  current_step: number;
  total_steps: number;
  last_updated: string;
  expires_at: string;
  created_at: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  category: string;
  template_data: {
    form: Partial<Form>;
    fields: Partial<FormField>[];
  };
  is_featured: boolean;
  tags?: string[];
  created_at: string;
}