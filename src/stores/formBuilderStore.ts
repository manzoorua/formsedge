import { create } from 'zustand';
import { Form, FormField } from '../types/form';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Deep equality check to avoid unnecessary state updates
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

interface FormBuilderState {
  // Data
  form: Form | null;
  fields: FormField[];
  isLoading: boolean;
  error: Error | null;
  pendingDeletions: string[]; // Track fields to delete from database
  lastSyncedAt: number | null; // Track last successful sync
  
  // UI State
  selectedFieldId: string | null;
  activeView: 'fields' | 'settings';
  showPreview: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  showAllFields: boolean;
  
  // Actions
  setForm: (form: Form) => void;
  updateFormSmart: (form: Form) => void;
  setFields: (fields: FormField[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setSelectedFieldId: (id: string | null) => void;
  setActiveView: (view: 'fields' | 'settings') => void;
  setShowPreview: (show: boolean) => void;
  setShowAllFields: (show: boolean) => void;
  markUnsavedChanges: () => void;
  
  // Field operations
  addField: (field: FormField) => void;
  updateField: (fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (fieldId: string) => void;
  duplicateField: (fieldId: string) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;
  
  // Async operations
  loadForm: (formId: string, userId: string) => Promise<void>;
  saveForm: (userId: string) => Promise<void>;
  createDefaultForm: (userId: string) => void;
  resetStore: () => void;
  validateStateIntegrity: () => boolean;
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  // Initial state
  form: null,
  fields: [],
  isLoading: false,
  error: null,
  pendingDeletions: [],
  lastSyncedAt: null,
  selectedFieldId: null,
  activeView: 'fields',
  showPreview: false,
  isSaving: false,
  hasUnsavedChanges: false,
  showAllFields: false,
  
  // Basic setters with smart change detection
  setForm: (form) => {
    const currentState = get();
    const hasChanged = !currentState.form || !deepEqual(currentState.form, form);
    
    set({ 
      form, 
      hasUnsavedChanges: hasChanged ? true : currentState.hasUnsavedChanges
    });
  },
  setFields: (fields) => {
    const currentState = get();
    const hasChanged = !currentState.fields || !deepEqual(currentState.fields, fields);
    set({ 
      fields, 
      hasUnsavedChanges: hasChanged ? true : currentState.hasUnsavedChanges
    });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedFieldId: (selectedFieldId) => set({ selectedFieldId }),
  setActiveView: (activeView) => set({ activeView }),
  setShowPreview: (showPreview) => set({ showPreview }),
  setShowAllFields: (showAllFields) => set({ showAllFields }),
  markUnsavedChanges: () => set({ hasUnsavedChanges: true }),
  
  // Smart form update that debounces and only marks dirty for real changes
  updateFormSmart: (form) => {
    const currentState = get();
    const hasChanged = !currentState.form || !deepEqual(currentState.form, form);
    if (hasChanged) {
      
      set({ form, hasUnsavedChanges: true });
    } else {
      
      set({ form }); // Update form without marking as dirty
    }
  },
  
  // Field operations
  addField: (field) => {
    const { fields } = get();
    const updatedField = { ...field, order_index: fields.length };
    
    set({ fields: [...fields, updatedField], hasUnsavedChanges: true });
    
    // Auto-save after adding field
    setTimeout(() => {
      const { form } = get();
      if (form) {
        
        // Note: This will be implemented with user context in the hook
      }
    }, 1000);
  },
  
  updateField: (fieldId, updates) => {
    const { fields } = get();
    
    // Handle deletion operation - immediate optimistic update
    if ((updates as any)._deleted) {
      
      get().deleteField(fieldId);
      return;
    }
    
    if ('_duplicate' in updates) {
      get().duplicateField(fieldId);
      return;
    }
    
    // Normalize data types for problematic fields
    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.validation_rules && typeof normalizedUpdates.validation_rules === 'string') {
      try {
        normalizedUpdates.validation_rules = JSON.parse(normalizedUpdates.validation_rules);
      } catch {
        normalizedUpdates.validation_rules = {};
      }
    }
    
    if (normalizedUpdates.conditional_logic && typeof normalizedUpdates.conditional_logic === 'string') {
      try {
        normalizedUpdates.conditional_logic = JSON.parse(normalizedUpdates.conditional_logic);
      } catch {
        normalizedUpdates.conditional_logic = {};
      }
    }
    
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...normalizedUpdates } : field
    );
    set({ fields: updatedFields, hasUnsavedChanges: true });
    
  },
  
  deleteField: (fieldId) => {
    const { fields, selectedFieldId } = get();
    const fieldToDelete = fields.find(f => f.id === fieldId);
    
    if (!fieldToDelete) {
      console.warn('Field not found for deletion:', fieldId);
      return;
    }
    
    // Immediate optimistic update - remove from local state
    const updatedFields = fields.filter(field => field.id !== fieldId);
    const newSelectedId = selectedFieldId === fieldId ? null : selectedFieldId;
    
    
    set({ 
      fields: updatedFields, 
      selectedFieldId: newSelectedId, 
      hasUnsavedChanges: true,
      pendingDeletions: [...(get().pendingDeletions || []), fieldId]
    });
  },
  
  duplicateField: (fieldId) => {
    const { fields } = get();
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      const duplicatedField: FormField = {
        ...field,
        id: uuidv4(),
        label: `${field.label} (Copy)`,
        order_index: fields.length,
      };
      
      set({ fields: [...fields, duplicatedField], hasUnsavedChanges: true });
    }
  },
  
  reorderFields: (oldIndex, newIndex) => {
    const { fields } = get();
    const newFields = [...fields];
    const [movedField] = newFields.splice(oldIndex, 1);
    newFields.splice(newIndex, 0, movedField);
    
    // Update order_index for all fields
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order_index: index,
    }));
    
    
    set({ fields: reorderedFields, hasUnsavedChanges: true });
  },
  
  // Async operations
  loadForm: async (formId, userId) => {
    // Guard: Validate UUID format before making database call
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!formId || !uuidRegex.test(formId)) {
      console.warn('loadForm called with invalid formId:', formId);
      set({
        isLoading: false,
        error: new Error('Invalid form ID'),
        form: null,
        fields: [],
      });
      toast.error('Failed to load form: invalid form ID.');
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      
      
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('owner_id', userId)
        .single();

      if (formError) {
        console.error('Form loading error:', formError);
        throw formError;
      }

      

      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('order_index');

      if (fieldsError) {
        console.error('Fields loading error:', fieldsError);
        throw fieldsError;
      }

      

      // Get current state to compare and avoid unnecessary updates
      const currentState = get();
      
      // Normalize form data - ensure layout exists with minimum 4 columns for width controls
      const formLayout = form.layout as any;
      const formBackground = form.background as any;
      const normalizedForm = {
        ...form,
        url_params_config: (form.url_params_config as unknown as any) || undefined,
        layout: {
          columns: Math.max(4, formLayout?.columns || 4),
          grid_gap: formLayout?.grid_gap || 'md',
          responsive: formLayout?.responsive ?? true,
        },
        background: formBackground ? {
          type: formBackground.type || 'color',
          value: formBackground.value || '#ffffff',
          opacity: formBackground.opacity,
          position: formBackground.position,
          size: formBackground.size,
        } : undefined,
      };

      

      // Normalize field data types with comprehensive handling
      const normalizedFields = (fields || []).map(field => {
        const normalized = {
          ...field,
          conditional_logic: typeof field.conditional_logic === 'object' && field.conditional_logic !== null 
            ? field.conditional_logic 
            : {},
          validation_rules: typeof field.validation_rules === 'object' && field.validation_rules !== null 
            ? field.validation_rules 
            : {},
          options: Array.isArray(field.options) 
            ? field.options 
            : (field.options || []),
          calculations: typeof field.calculations === 'object' && field.calculations !== null 
            ? field.calculations 
            : {},
          styling: typeof field.styling === 'object' && field.styling !== null 
            ? field.styling 
            : {},
          // Ensure width property is available from styling or direct field property
          width: (field as any).width || ((field.styling as any)?.width) || 'full',
        };
        
        return normalized;
      });

      

      // Deep comparison to avoid false positive changes from normalization
      const hasFormChanged = !currentState.form || 
        !deepEqual(currentState.form, normalizedForm);
      const hasFieldsChanged = !currentState.fields || 
        !deepEqual(currentState.fields, normalizedFields);

      // Only mark as changed if this is genuinely new data (first load or real changes)
      const isFirstLoad = currentState.lastSyncedAt === null;
      const shouldMarkAsChanged = false; // Never mark as changed during load

      set({ 
        form: normalizedForm as Form, 
        fields: normalizedFields, 
        isLoading: false,
        error: null,
        pendingDeletions: [], // Clear pending deletions on fresh load
        hasUnsavedChanges: false, // Always false after loading - this is synced data
        lastSyncedAt: Date.now()
      });
    } catch (error: any) {
      console.error('Critical error loading form:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      set({ 
        isLoading: false, 
        error: error as Error,
        form: null,
        fields: []
      });
      toast.error(`Failed to load form: ${error?.message || 'Unknown error'}`);
    }
  },
  
  saveForm: async (userId) => {
    const { form, fields, pendingDeletions } = get();
    if (!form) {
      console.error('No form to save');
      toast.error('No form to save');
      return;
    }
    
    set({ isSaving: true });
    
    try {
      // 1. Delete pending fields from database first
      if (pendingDeletions.length > 0) {
        
        const { error: deleteError } = await supabase
          .from('form_fields')
          .delete()
          .in('id', pendingDeletions);

        if (deleteError) {
          console.error('Error deleting pending fields:', deleteError);
          throw new Error(`Failed to delete fields: ${deleteError.message}`);
        }
        
        
      }

      // 2. Update form with comprehensive error checking
      
      const { error: formError } = await supabase
        .from('forms')
        .upsert({
          id: form.id,
          title: form.title,
          description: form.description,
          status: form.status,
          is_public: form.is_public,
          accept_responses: form.accept_responses,
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
          font_family: form.font_family,
          enable_partial_save: form.enable_partial_save,
          auto_save_interval: form.auto_save_interval,
          thank_you_message: form.thank_you_message,
          enable_analytics: form.enable_analytics,
          layout: form.layout,
          // Design fields
          logo_url: form.logo_url || null,
          custom_css: form.custom_css || null,
          redirect_url: form.redirect_url || null,
          background: form.background || null,
          owner_id: userId,
          updated_at: new Date().toISOString(),
        });

      if (formError) {
        console.error('Form save error:', formError);
        throw formError;
      }

      // 3. Save current fields with enhanced validation and error handling
      if (fields.length > 0) {
        
        
        // Valid field types based on database enum
        const validFieldTypes = [
          'text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 
          'file', 'date', 'rating', 'slider', 'phone', 'time', 'matrix', 
          'divider', 'html', 'multiselect', 'signature', 'pagebreak', 'section'
        ];

        let fieldSaveErrors: string[] = [];
        let successfulSaves = 0;

        for (const field of fields) {
          // Validate field type before attempting save
          if (!validFieldTypes.includes(field.type)) {
            const error = `Invalid field type '${field.type}' for field '${field.label}'. Skipping.`;
            console.error(error);
            fieldSaveErrors.push(error);
            continue;
          }

          const fieldData = {
            id: field.id,
            form_id: form.id,
            type: field.type as any,
            label: field.label,
            description: field.description || null,
            placeholder: field.placeholder || null,
            required: field.required || false,
            order_index: field.order_index ?? successfulSaves,
            options: field.options || null,
            validation_rules: field.validation_rules || null,
            conditional_logic: field.conditional_logic || null,
            calculations: field.calculations || null,
            styling: field.styling || null,
            width: field.width || null,
          };

          

          const { error: fieldError } = await supabase
            .from('form_fields')
            .upsert(fieldData, { onConflict: 'id' });

          if (fieldError) {
            const error = `Failed to save field '${field.label}': ${fieldError.message}`;
            console.error(error, fieldError);
            fieldSaveErrors.push(error);
          } else {
            successfulSaves++;
            
          }
        }

        // Report results
        if (fieldSaveErrors.length > 0) {
          console.warn(`Save completed with ${fieldSaveErrors.length} field errors:`, fieldSaveErrors);
          toast.error(`Form saved with ${fieldSaveErrors.length} field error(s). Some fields may not have been saved.`);
        }

        
      }

      // Verify the save was successful without triggering reload cycle
      const { data: verifyFormData } = await supabase
        .from('forms')
        .select('id')
        .eq('id', form.id)
        .single();

      const { data: verifyFieldsData } = await supabase
        .from('form_fields')
        .select('id')
        .eq('form_id', form.id);

      
      // Only reload if there's a genuine data integrity issue (not just count mismatch)
      if (!verifyFormData) {
        console.error('Form not found after save - this is a critical error');
        throw new Error('Form was not saved properly');
      }
      
      // 4. Clear state after successful save
      set({ 
        pendingDeletions: [], 
        hasUnsavedChanges: false, 
        lastSyncedAt: Date.now() 
      });
      
      
      // Only show toast for manual saves - will be controlled by caller
    } catch (error: any) {
      console.error('Critical save error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      toast.error(`Failed to save form: ${error?.message || 'Unknown error'}`);
    } finally {
      set({ isSaving: false });
    }
  },
  
  resetStore: () => {
    set({
      form: null,
      fields: [],
      selectedFieldId: null,
      activeView: 'fields',
      showPreview: false,
      isLoading: false,
      error: null,
      isSaving: false,
      pendingDeletions: [],
      hasUnsavedChanges: false,
      lastSyncedAt: null,
    });
    
  },

  validateStateIntegrity: () => {
    const { form, fields, lastSyncedAt } = get();
    
    // Check if state is in sync
    const isValid = form !== null && Array.isArray(fields) && lastSyncedAt !== null;
    
    if (!isValid) {
      console.warn('State integrity check failed:', {
        hasForm: !!form,
        fieldsArray: Array.isArray(fields),
        fieldsCount: fields?.length,
        lastSync: lastSyncedAt
      });
    }
    
    return isValid;
  },

  createDefaultForm: (userId) => {
    const defaultForm: Form = {
      id: uuidv4(),
      title: 'Untitled Form',
      description: '',
      status: 'draft',
      is_public: true,
      accept_responses: true,
      owner_id: userId,
      primary_color: 'hsl(217, 91%, 60%)',
      secondary_color: 'hsl(215, 25%, 27%)',
      font_family: 'Inter',
      layout: {
        columns: 4,
        grid_gap: 'md',
        responsive: true,
      },
      enable_partial_save: true,
      auto_save_interval: 10,
      
      thank_you_message: 'Thank you for your submission!',
      enable_analytics: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set({ 
      form: defaultForm, 
      fields: [], 
      pendingDeletions: [],
      hasUnsavedChanges: false,
      lastSyncedAt: Date.now()
    });
  },
}));