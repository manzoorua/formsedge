export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_hours: string | null
          city_state_zip: string | null
          country: string | null
          created_at: string | null
          emergency_phone: string | null
          general_email: string | null
          id: string
          sales_email: string | null
          sales_phone: string | null
          support_email: string | null
          support_phone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_hours?: string | null
          city_state_zip?: string | null
          country?: string | null
          created_at?: string | null
          emergency_phone?: string | null
          general_email?: string | null
          id?: string
          sales_email?: string | null
          sales_phone?: string | null
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_hours?: string | null
          city_state_zip?: string | null
          country?: string | null
          created_at?: string | null
          emergency_phone?: string | null
          general_email?: string | null
          id?: string
          sales_email?: string | null
          sales_phone?: string | null
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      contact_submission_notes: {
        Row: {
          admin_id: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          note: string
          submission_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note: string
          submission_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_submission_notes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          inquiry_type: string
          message: string
          phone: string | null
          priority: string
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          inquiry_type: string
          message: string
          phone?: string | null
          priority?: string
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          inquiry_type?: string
          message?: string
          phone?: string | null
          priority?: string
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      data_access_logs: {
        Row: {
          accessed_at: string | null
          action: string | null
          id: string
          ip_address: unknown
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          action?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          action?: string | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      field_analytics: {
        Row: {
          avg_time_spent: number | null
          completions: number | null
          created_at: string
          date: string
          drop_offs: number | null
          field_id: string
          form_id: string
          id: string
          interactions: number | null
          views: number | null
        }
        Insert: {
          avg_time_spent?: number | null
          completions?: number | null
          created_at?: string
          date?: string
          drop_offs?: number | null
          field_id: string
          form_id: string
          id?: string
          interactions?: number | null
          views?: number | null
        }
        Update: {
          avg_time_spent?: number | null
          completions?: number | null
          created_at?: string
          date?: string
          drop_offs?: number | null
          field_id?: string
          form_id?: string
          id?: string
          interactions?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "field_analytics_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_analytics_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "public_form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_analytics_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_analytics_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          created_at: string | null
          field_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          response_id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          field_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          response_id: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          field_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          response_id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_uploads_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "public_form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_uploads_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_analytics: {
        Row: {
          avg_completion_time: number | null
          completions: number | null
          created_at: string | null
          date: string
          drop_off_rate: number | null
          form_id: string
          id: string
          starts: number | null
          views: number | null
        }
        Insert: {
          avg_completion_time?: number | null
          completions?: number | null
          created_at?: string | null
          date: string
          drop_off_rate?: number | null
          form_id: string
          id?: string
          starts?: number | null
          views?: number | null
        }
        Update: {
          avg_completion_time?: number | null
          completions?: number | null
          created_at?: string | null
          date?: string
          drop_off_rate?: number | null
          form_id?: string
          id?: string
          starts?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "form_analytics_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_analytics_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_edit_locks: {
        Row: {
          created_at: string
          expires_at: string
          form_id: string
          id: string
          instance_id: string
          locked_at: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          form_id: string
          id?: string
          instance_id: string
          locked_at?: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          form_id?: string
          id?: string
          instance_id?: string
          locked_at?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          calculations: Json | null
          conditional_logic: Json | null
          created_at: string | null
          description: string | null
          form_id: string
          id: string
          label: string
          logic_conditions: Json | null
          options: Json | null
          order_index: number
          placeholder: string | null
          ref: string | null
          required: boolean | null
          styling: Json | null
          type: Database["public"]["Enums"]["field_type"]
          validation_rules: Json | null
          width: string | null
        }
        Insert: {
          calculations?: Json | null
          conditional_logic?: Json | null
          created_at?: string | null
          description?: string | null
          form_id: string
          id?: string
          label: string
          logic_conditions?: Json | null
          options?: Json | null
          order_index: number
          placeholder?: string | null
          ref?: string | null
          required?: boolean | null
          styling?: Json | null
          type: Database["public"]["Enums"]["field_type"]
          validation_rules?: Json | null
          width?: string | null
        }
        Update: {
          calculations?: Json | null
          conditional_logic?: Json | null
          created_at?: string | null
          description?: string | null
          form_id?: string
          id?: string
          label?: string
          logic_conditions?: Json | null
          options?: Json | null
          order_index?: number
          placeholder?: string | null
          ref?: string | null
          required?: boolean | null
          styling?: Json | null
          type?: Database["public"]["Enums"]["field_type"]
          validation_rules?: Json | null
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_integrations: {
        Row: {
          configuration: Json
          created_at: string
          created_by: string
          form_id: string
          id: string
          integration_type: string
          is_active: boolean
          last_error: string | null
          last_triggered_at: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          created_by: string
          form_id: string
          id?: string
          integration_type: string
          is_active?: boolean
          last_error?: string | null
          last_triggered_at?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          created_by?: string
          form_id?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          last_error?: string | null
          last_triggered_at?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_response_answers: {
        Row: {
          created_at: string | null
          field_id: string
          file_urls: Json | null
          id: string
          response_id: string
          value: string | null
        }
        Insert: {
          created_at?: string | null
          field_id: string
          file_urls?: Json | null
          id?: string
          response_id: string
          value?: string | null
        }
        Update: {
          created_at?: string | null
          field_id?: string
          file_urls?: Json | null
          id?: string
          response_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_response_answers_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_response_answers_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "public_form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_response_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          created_at: string | null
          form_id: string
          id: string
          is_partial: boolean | null
          respondent_email: string | null
          respondent_id: string | null
          submitted_at: string | null
          updated_at: string | null
          url_params: Json | null
        }
        Insert: {
          created_at?: string | null
          form_id: string
          id?: string
          is_partial?: boolean | null
          respondent_email?: string | null
          respondent_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          url_params?: Json | null
        }
        Update: {
          created_at?: string | null
          form_id?: string
          id?: string
          is_partial?: boolean | null
          respondent_email?: string | null
          respondent_id?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          url_params?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          tags: string[] | null
          template_data: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          template_data: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          template_data?: Json
          title?: string
        }
        Relationships: []
      }
      form_themes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          name: string
          theme_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name: string
          theme_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name?: string
          theme_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      form_transitions: {
        Row: {
          created_at: string
          from_form_id: string
          id: string
          is_default: boolean | null
          to_form_id: string | null
        }
        Insert: {
          created_at?: string
          from_form_id: string
          id?: string
          is_default?: boolean | null
          to_form_id?: string | null
        }
        Update: {
          created_at?: string
          from_form_id?: string
          id?: string
          is_default?: boolean | null
          to_form_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_transitions_from_form_id_fkey"
            columns: ["from_form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_transitions_from_form_id_fkey"
            columns: ["from_form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_transitions_to_form_id_fkey"
            columns: ["to_form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_transitions_to_form_id_fkey"
            columns: ["to_form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          accept_responses: boolean | null
          auto_save_interval: number | null
          background: Json | null
          branding_color: string | null
          branding_enabled: boolean | null
          branding_logo_url: string | null
          collect_emails: boolean | null
          created_at: string | null
          custom_css: string | null
          custom_url: string | null
          description: string | null
          enable_analytics: boolean | null
          enable_partial_save: boolean | null
          font_family: string | null
          id: string
          is_public: boolean | null
          layout: Json | null
          limit_responses: boolean | null
          logo_url: string | null
          max_responses: number | null
          notification_email: string | null
          org_id: string | null
          owner_id: string
          primary_color: string | null
          redirect_url: string | null
          secondary_color: string | null
          status: Database["public"]["Enums"]["form_status"] | null
          thank_you_message: string | null
          theme_id: string | null
          title: string
          updated_at: string | null
          url_params_config: Json | null
          webhook_url: string | null
        }
        Insert: {
          accept_responses?: boolean | null
          auto_save_interval?: number | null
          background?: Json | null
          branding_color?: string | null
          branding_enabled?: boolean | null
          branding_logo_url?: string | null
          collect_emails?: boolean | null
          created_at?: string | null
          custom_css?: string | null
          custom_url?: string | null
          description?: string | null
          enable_analytics?: boolean | null
          enable_partial_save?: boolean | null
          font_family?: string | null
          id?: string
          is_public?: boolean | null
          layout?: Json | null
          limit_responses?: boolean | null
          logo_url?: string | null
          max_responses?: number | null
          notification_email?: string | null
          org_id?: string | null
          owner_id: string
          primary_color?: string | null
          redirect_url?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["form_status"] | null
          thank_you_message?: string | null
          theme_id?: string | null
          title: string
          updated_at?: string | null
          url_params_config?: Json | null
          webhook_url?: string | null
        }
        Update: {
          accept_responses?: boolean | null
          auto_save_interval?: number | null
          background?: Json | null
          branding_color?: string | null
          branding_enabled?: boolean | null
          branding_logo_url?: string | null
          collect_emails?: boolean | null
          created_at?: string | null
          custom_css?: string | null
          custom_url?: string | null
          description?: string | null
          enable_analytics?: boolean | null
          enable_partial_save?: boolean | null
          font_family?: string | null
          id?: string
          is_public?: boolean | null
          layout?: Json | null
          limit_responses?: boolean | null
          logo_url?: string | null
          max_responses?: number | null
          notification_email?: string | null
          org_id?: string | null
          owner_id?: string
          primary_color?: string | null
          redirect_url?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["form_status"] | null
          thank_you_message?: string | null
          theme_id?: string | null
          title?: string
          updated_at?: string | null
          url_params_config?: Json | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "form_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partial_submissions: {
        Row: {
          created_at: string
          data: Json
          expires_at: string
          form_id: string
          id: string
          last_updated: string
          respondent_id: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          expires_at?: string
          form_id: string
          id?: string
          last_updated?: string
          respondent_id?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          expires_at?: string
          form_id?: string
          id?: string
          last_updated?: string
          respondent_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partial_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partial_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: unknown
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          created_at: string
          id: string
          paid_at: string | null
          referral_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_settings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_settings_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          setting_id: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          setting_id?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          setting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_settings_history_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "referral_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code_id: string
          referred_id: string
          referrer_id: string
          reward_earned: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code_id: string
          referred_id: string
          referrer_id: string
          reward_earned?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_id?: string
          referrer_id?: string
          reward_earned?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          endpoint: string | null
          event_type: string
          id: string
          ip_address: unknown
          payload: Json | null
          risk_level: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          payload?: Json | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          payload?: Json | null
          risk_level?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_subscription_tier_fkey"
            columns: ["subscription_tier"]
            isOneToOne: false
            referencedRelation: "public_subscription_tiers"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "subscribers_subscription_tier_fkey"
            columns: ["subscription_tier"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["name"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_forms: number | null
          max_org_members: number | null
          max_responses_per_form: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_forms?: number | null
          max_org_members?: number | null
          max_responses_per_form?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_forms?: number | null
          max_org_members?: number | null
          max_responses_per_form?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          category: string
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          config_key: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_config_audit: {
        Row: {
          changed_at: string
          changed_by: string | null
          config_id: string | null
          config_key: string
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          config_id?: string | null
          config_key: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          config_id?: string | null
          config_key?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "system_config_audit_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "system_config"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          form_id: string | null
          id: string
          invited_by: string
          org_id: string | null
          role: Database["public"]["Enums"]["team_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          form_id?: string | null
          id?: string
          invited_by: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          form_id?: string | null
          id?: string
          invited_by?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          form_id: string
          id: string
          invited_at: string | null
          invited_by: string | null
          role: Database["public"]["Enums"]["team_role"] | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          form_id: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"] | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          form_id?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          role?: Database["public"]["Enums"]["team_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          api_calls: number | null
          created_at: string
          forms_created: number | null
          id: string
          period_end: string
          period_start: string
          responses_received: number | null
          storage_used_mb: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_calls?: number | null
          created_at?: string
          forms_created?: number | null
          id?: string
          period_end: string
          period_start: string
          responses_received?: number | null
          storage_used_mb?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_calls?: number | null
          created_at?: string
          forms_created?: number | null
          id?: string
          period_end?: string
          period_start?: string
          responses_received?: number | null
          storage_used_mb?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_support_notes: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          note: string
          priority: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          note: string
          priority?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          note?: string
          priority?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_delivery_logs: {
        Row: {
          attempt: number
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          form_id: string
          http_status: number | null
          id: string
          integration_id: string
          request_body: Json | null
          response_body: string | null
          response_id: string | null
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type?: string
          form_id: string
          http_status?: number | null
          id?: string
          integration_id: string
          request_body?: Json | null
          response_body?: string | null
          response_id?: string | null
          status: string
          updated_at?: string
          url: string
        }
        Update: {
          attempt?: number
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          form_id?: string
          http_status?: number | null
          id?: string
          integration_id?: string
          request_body?: Json | null
          response_body?: string | null
          response_id?: string | null
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_delivery_logs_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_delivery_logs_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_delivery_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "form_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_delivery_logs_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_form_fields: {
        Row: {
          description: string | null
          form_id: string | null
          id: string | null
          label: string | null
          options: Json | null
          order_index: number | null
          placeholder: string | null
          required: boolean | null
          styling: Json | null
          type: Database["public"]["Enums"]["field_type"] | null
          width: string | null
        }
        Insert: {
          description?: string | null
          form_id?: string | null
          id?: string | null
          label?: string | null
          options?: Json | null
          order_index?: number | null
          placeholder?: string | null
          required?: boolean | null
          styling?: Json | null
          type?: Database["public"]["Enums"]["field_type"] | null
          width?: string | null
        }
        Update: {
          description?: string | null
          form_id?: string | null
          id?: string | null
          label?: string | null
          options?: Json | null
          order_index?: number | null
          placeholder?: string | null
          required?: boolean | null
          styling?: Json | null
          type?: Database["public"]["Enums"]["field_type"] | null
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "public_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      public_forms: {
        Row: {
          accept_responses: boolean | null
          branding_color: string | null
          branding_enabled: boolean | null
          branding_logo_url: string | null
          collect_emails: boolean | null
          custom_url: string | null
          description: string | null
          font_family: string | null
          id: string | null
          is_public: boolean | null
          layout: Json | null
          limit_responses: boolean | null
          logo_url: string | null
          max_responses: number | null
          primary_color: string | null
          redirect_url: string | null
          secondary_color: string | null
          status: Database["public"]["Enums"]["form_status"] | null
          thank_you_message: string | null
          title: string | null
        }
        Insert: {
          accept_responses?: boolean | null
          branding_color?: string | null
          branding_enabled?: boolean | null
          branding_logo_url?: string | null
          collect_emails?: boolean | null
          custom_url?: string | null
          description?: string | null
          font_family?: string | null
          id?: string | null
          is_public?: boolean | null
          layout?: Json | null
          limit_responses?: boolean | null
          logo_url?: string | null
          max_responses?: number | null
          primary_color?: string | null
          redirect_url?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["form_status"] | null
          thank_you_message?: string | null
          title?: string | null
        }
        Update: {
          accept_responses?: boolean | null
          branding_color?: string | null
          branding_enabled?: boolean | null
          branding_logo_url?: string | null
          collect_emails?: boolean | null
          custom_url?: string | null
          description?: string | null
          font_family?: string | null
          id?: string | null
          is_public?: boolean | null
          layout?: Json | null
          limit_responses?: boolean | null
          logo_url?: string | null
          max_responses?: number | null
          primary_color?: string | null
          redirect_url?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["form_status"] | null
          thank_you_message?: string | null
          title?: string | null
        }
        Relationships: []
      }
      public_subscription_tiers: {
        Row: {
          description: string | null
          features: Json | null
          id: string | null
          max_forms: number | null
          max_responses_per_form: number | null
          name: string | null
          price_monthly: number | null
          price_yearly: number | null
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          features?: Json | null
          id?: string | null
          max_forms?: number | null
          max_responses_per_form?: number | null
          name?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          features?: Json | null
          id?: string | null
          max_forms?: number | null
          max_responses_per_form?: number | null
          name?: string | null
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_form: {
        Args: { form_id: string; user_id: string }
        Returns: boolean
      }
      can_access_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_response: {
        Args: { response_id: string; user_id: string }
        Returns: boolean
      }
      check_is_admin: { Args: { user_id_param: string }; Returns: boolean }
      check_rate_limit: {
        Args: {
          endpoint_name: string
          ip_addr: unknown
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_form_locks: { Args: never; Returns: undefined }
      cleanup_expired_partial_submissions: { Args: never; Returns: undefined }
      count_org_members: { Args: { org_id_param: string }; Returns: number }
      get_masked_respondent_email: {
        Args: { requesting_user_id: string; response_id: string }
        Returns: string
      }
      get_secure_form_response_answers: {
        Args: { form_id_param?: string; response_id_param?: string }
        Returns: {
          created_at: string
          field_id: string
          field_label: string
          field_type: string
          file_urls: Json
          id: string
          response_id: string
          value: string
        }[]
      }
      get_secure_form_responses: {
        Args: { form_id_param?: string }
        Returns: {
          created_at: string
          form_id: string
          id: string
          is_partial: boolean
          respondent_email: string
          respondent_id: string
          submitted_at: string
          updated_at: string
        }[]
      }
      get_user_org_member_limit: {
        Args: { user_id_param: string }
        Returns: number
      }
      get_user_organizations: {
        Args: { _user_id: string }
        Returns: {
          org_id: string
          org_name: string
          org_slug: string
          role: Database["public"]["Enums"]["org_role"]
        }[]
      }
      get_user_role_for_form: {
        Args: { form_id: string; user_id: string }
        Returns: Database["public"]["Enums"]["team_role"]
      }
      has_org_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["org_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_form_owner: {
        Args: { form_id: string; user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_name: string
          new_data?: Json
          old_data?: Json
          target_record_id?: string
          target_table_name?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          endpoint_param?: string
          event_type_param: string
          ip_address_param?: unknown
          payload_param?: Json
          risk_level_param?: string
          user_agent_param?: string
          user_id_param?: string
        }
        Returns: undefined
      }
      mask_email: {
        Args: { email: string; form_owner_id: string; user_id: string }
        Returns: string
      }
      mask_sensitive_field_value: {
        Args: {
          field_type: string
          field_value: string
          form_owner_id: string
          respondent_id: string
          user_id: string
        }
        Returns: string
      }
      promote_to_admin: {
        Args: { admin_role?: string; target_user_id: string }
        Returns: boolean
      }
      setup_first_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      field_type:
        | "text"
        | "email"
        | "number"
        | "textarea"
        | "select"
        | "radio"
        | "checkbox"
        | "file"
        | "date"
        | "rating"
        | "slider"
        | "phone"
        | "time"
        | "matrix"
        | "divider"
        | "html"
        | "multiselect"
        | "signature"
        | "pagebreak"
        | "section"
      form_status: "draft" | "published" | "archived"
      org_role: "owner" | "admin" | "member" | "billing_admin"
      subscription_plan: "free" | "pro"
      team_role: "viewer" | "editor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      field_type: [
        "text",
        "email",
        "number",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "file",
        "date",
        "rating",
        "slider",
        "phone",
        "time",
        "matrix",
        "divider",
        "html",
        "multiselect",
        "signature",
        "pagebreak",
        "section",
      ],
      form_status: ["draft", "published", "archived"],
      org_role: ["owner", "admin", "member", "billing_admin"],
      subscription_plan: ["free", "pro"],
      team_role: ["viewer", "editor", "admin"],
    },
  },
} as const
