import { useEffect, useCallback, useRef } from 'react';
import { useFormBuilderStore } from '../stores/formBuilderStore';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useAutoSave } from './useAutoSave';
import { useFormRealtimeSync } from './useFormRealtimeSync';
import { formLockService } from '@/services/formLockService';
import { tabCoordinationService } from '@/services/tabCoordinationService';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

interface UseFormBuilderReturn {
  // Data
  form: any;
  fields: any[];
  isLoading: boolean;
  error: Error | null;
  
  // UI State
  selectedFieldId: string | null;
  activeView: 'fields' | 'settings';
  showPreview: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  // lastSaved: Date | null; // Not implemented yet
  
  // Actions
  setForm: (form: any) => void;
  updateFormSmart: (form: any) => void;
  addField: (field: any) => void;
  updateField: (fieldId: string, updates: any) => void;
  deleteField: (fieldId: string) => void;
  duplicateField: (fieldId: string) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;
  setSelectedField: (id: string | null) => void;
  setActiveView: (view: 'fields' | 'settings') => void;
  setShowPreview: (show: boolean) => void;
  saveForm: () => Promise<void>;
  saveNow: () => Promise<void>;
  
  // Collaboration features
  getActiveCollaborators: () => any[];
  isRealtimeConnected: boolean;
  lockService: typeof formLockService;
}

// Helper function to check if string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useFormBuilderRefactored = (formId?: string): UseFormBuilderReturn => {
  const { user } = useAuth();
  const store = useFormBuilderStore();
  const [searchParams] = useSearchParams();
  
  // Initialization guards to prevent race conditions
  const isInitializedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const currentFormIdRef = useRef<string | undefined>(undefined);

  const {
    form,
    fields,
    isLoading,
    isSaving,
    error,
    loadForm,
    resetStore,
    saveForm: saveFormToStore,
    hasUnsavedChanges,
    // lastSaved, // Not available in store yet
    selectedFieldId,
    activeView,
    showPreview,
    setForm,
    updateFormSmart,
    addField,
    updateField,
    deleteField,
    duplicateField,
    reorderFields,
    setSelectedFieldId,
    setActiveView,
    setShowPreview
  } = store;

  // Setup realtime synchronization
  const { updateTimestamp, getActiveCollaborators, isRealtimeConnected } = useFormRealtimeSync(
    formId === 'new' ? null : formId,
    !!user && formId !== 'new'
  );

  // Enhanced save function with realtime coordination
  const saveForm = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    updateTimestamp(); // Mark that we're making a change
    const result = await saveFormToStore(user.id);
    
    return result;
  }, [user?.id, saveFormToStore, updateTimestamp]);

  // Auto-save functionality with conflict detection
  const { saveNow, updateKnownVersion } = useAutoSave({
    interval: 30000, // 30 seconds
    hasUnsavedChanges: hasUnsavedChanges,
    onSave: saveForm,
    enabled: true, // Re-enabled with enhanced conflict detection
    formId: formId === 'new' ? undefined : formId,
  });

  // Load form when component mounts or formId changes
  useEffect(() => {
    const initializeForm = async () => {
      if (!user?.id) return;
      
      // Guard: Wait for formId to be resolved
      if (!formId) {
        return;
      }

      // Guard: Prevent concurrent loads
      if (isLoadingRef.current) {
        console.log('Already loading, skipping...');
        return;
      }

      // Guard: Skip if already initialized for this formId
      if (isInitializedRef.current && currentFormIdRef.current === formId) {
        console.log('Already initialized for this formId, skipping...');
        return;
      }

      isLoadingRef.current = true;

      try {
        // Only reset if switching to a different form
        if (currentFormIdRef.current !== formId) {
          resetStore();
          currentFormIdRef.current = formId;
        }
        
        if (formId === 'new') {
          // Check for template in URL params FIRST
          const templateId = searchParams.get('template');
          
          if (templateId) {
            // Apply template directly (creates form + fields)
            await applyTemplate(templateId);
          } else {
            // No template - create blank form
            store.createDefaultForm(user.id);
          }
          isInitializedRef.current = true;
        } else if (isValidUUID(formId)) {
          // Only load existing forms when the ID is a valid UUID
          await loadForm(formId, user.id);
          isInitializedRef.current = true;
          
          // Set active form for tab coordination
          tabCoordinationService.setActiveForm(formId);
          
          // Try to acquire edit lock for multi-instance coordination
          const lockResult = await formLockService.acquireLock(formId);
          if (!lockResult.success && lockResult.conflictingLock) {
            console.warn('Form is being edited by another user:', lockResult.conflictingLock);
          }
        } else {
          // Invalid formId string (not a valid UUID)
          console.warn('Invalid formId, not a valid UUID:', formId);
          toast.error('Invalid form ID. Please check the URL.');
        }
      } catch (error) {
        console.error('Error initializing form:', error);
        isInitializedRef.current = false;
      } finally {
        isLoadingRef.current = false;
      }
    };

    initializeForm();
    
    // Cleanup function
    return () => {
      if (formId && formId !== 'new') {
        formLockService.releaseLock(formId);
      }
      // Reset initialization state when unmounting or formId changes
      if (currentFormIdRef.current !== formId) {
        isInitializedRef.current = false;
      }
    };
  }, [formId, user?.id]); // Removed unstable dependencies: loadForm, resetStore, searchParams

  // Apply template function
  const applyTemplate = async (templateId: string) => {
    try {
      // First get the template
      const { data: template, error: templateError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error('Template not found');

      // Create form with template data
      const templateData = template.template_data as any;
      const formData = {
        title: `${template.title} (Copy)`,
        description: template.description,
        owner_id: user?.id,
        status: 'draft' as const,
        url_params_config: templateData?.url_params_config || undefined,
      };

      const { data: newForm, error: formError } = await supabase
        .from('forms')
        .insert(formData)
        .select()
        .single();

      if (formError) throw formError;

      // Normalize form data and set in store
      const normalizedForm = {
        ...newForm,
        layout: typeof newForm.layout === 'object' && newForm.layout !== null ? 
          newForm.layout : {
            columns: 1,
            grid_gap: 'md',
            responsive: true,
          },
      } as any;
      setForm(normalizedForm);

      // Insert template fields if they exist
      if (templateData && templateData.fields && templateData.fields.length > 0) {
        // Validate and map template fields using explicit field mapping
        const fieldsToInsert = templateData.fields.map((field: any, index: number) => {
          // Validate required fields
          if (!field.type) {
            console.error('Template field missing required type:', field);
            throw new Error(`Template field at index ${index} is missing required 'type' property`);
          }
          if (!field.label) {
            console.error('Template field missing required label:', field);
            throw new Error(`Template field at index ${index} is missing required 'label' property`);
          }

          // Explicit field mapping - only include known, valid database columns
          return {
            form_id: newForm.id,
            type: field.type,
            label: field.label,
            ref: field.ref || null,
            description: field.description || null,
            placeholder: field.placeholder || null,
            required: Boolean(field.required),
            order_index: index,
            width: (field.width === 'full' || field.width === 'half' || field.width === 'quarter') ? field.width : 'full',
            options: Array.isArray(field.options) ? field.options : null,
            validation_rules: field.validation_rules && typeof field.validation_rules === 'object' ? field.validation_rules : null,
            conditional_logic: field.conditional_logic && typeof field.conditional_logic === 'object' ? field.conditional_logic : null,
            calculations: field.calculations && typeof field.calculations === 'object' ? field.calculations : null,
            styling: field.styling && typeof field.styling === 'object' ? field.styling : null,
          };
        });

        console.log('Inserting template fields:', fieldsToInsert);

        const { data: insertedFields, error: fieldsError } = await supabase
          .from('form_fields')
          .insert(fieldsToInsert)
          .select();

        if (fieldsError) {
          console.error('Field insertion error:', fieldsError);
          throw fieldsError;
        }

        // Normalize field data and set in store
        if (insertedFields) {
          const normalizedFields = insertedFields.map(field => ({
            ...field,
            width: (field.width === 'full' || field.width === 'half' || field.width === 'quarter') ? 
              field.width : 'full',
            options: Array.isArray(field.options) ? field.options : undefined,
          })) as any;
          store.setFields(normalizedFields);
        }
      }

      toast.success('Template applied successfully!');
    } catch (error) {
      console.error('Error applying template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to apply template: ${errorMessage}. Creating blank form instead.`);
      store.createDefaultForm(user?.id);
    }
  };

  return {
    // Data
    form,
    fields,
    isLoading,
    error,
    
    // UI State
    selectedFieldId,
    activeView,
    showPreview,
    isSaving,
    hasUnsavedChanges,
    // lastSaved, // Not available yet
    
    // Actions
    setForm,
    updateFormSmart,
    addField,
    updateField,
    deleteField,
    duplicateField,
    reorderFields,
    setSelectedField: setSelectedFieldId,
    setActiveView,
    setShowPreview,
    saveForm,
    saveNow: async () => {
      await saveForm();
      toast.success("Form saved successfully");
    },
    
    // Additional collaboration features
    getActiveCollaborators,
    isRealtimeConnected,
    
    // Lock service access
    lockService: formLockService
  };
};