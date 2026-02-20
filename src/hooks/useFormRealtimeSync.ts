import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { FormField, Form } from '@/types/form';
import { tabCoordinationService, TabMessage } from '@/services/tabCoordinationService';
import { formLockService } from '@/services/formLockService';

export interface FormCollaborator {
  userId: string;
  instanceId: string;
  lastSeen: Date;
  isActive: boolean;
}

export const useFormRealtimeSync = (formId: string | null, enabled: boolean = true) => {
  const channelRef = useRef<any>(null);
  const lastUpdateTimestamp = useRef<number>(0);
  const collaborators = useRef<Map<string, FormCollaborator>>(new Map());
  
  const {
    form,
    fields,
    updateFormSmart,
    updateField,
    setFields,
    setForm
  } = useFormBuilderStore();

  // Use refs for form and fields to prevent callback recreation
  const formRef = useRef(form);
  const fieldsRef = useRef(fields);
  
  // Keep refs in sync with current values
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  /**
   * Handle real-time form updates from other instances
   */
  const handleFormUpdate = useCallback((payload: any) => {
    const { new: updatedForm } = payload;
    
    // Ignore updates from our own instance
    if (updatedForm.updated_at && new Date(updatedForm.updated_at).getTime() <= lastUpdateTimestamp.current) {
      return;
    }

    // Check if this is a newer version (use ref to avoid dependency)
    const currentForm = formRef.current;
    if (!currentForm || new Date(updatedForm.updated_at) > new Date(currentForm.updated_at)) {
      console.log('Received form update from other instance:', updatedForm);
      updateFormSmart(updatedForm);
      
      // Broadcast to other tabs on same origin
      tabCoordinationService.broadcastFormUpdate(updatedForm.id, updatedForm);
    }
  }, [updateFormSmart]);

  /**
   * Handle real-time field updates from other instances
   */
  const handleFieldUpdate = useCallback((payload: any) => {
    const { new: updatedField, eventType } = payload;
    
    // Ignore updates from our own instance
    if (updatedField.updated_at && new Date(updatedField.updated_at).getTime() <= lastUpdateTimestamp.current) {
      return;
    }

    console.log('Received field update from other instance:', eventType, updatedField);

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      updateField(updatedField.id, updatedField);
      
      // Broadcast to other tabs
      tabCoordinationService.broadcastFieldUpdate(updatedField.form_id, updatedField.id, updatedField);
    } else if (eventType === 'DELETE') {
      // Handle field deletion (use ref to avoid dependency)
      const currentFields = fieldsRef.current.filter(f => f.id !== updatedField.id);
      setFields(currentFields);
    }
  }, [updateField, setFields]);

  /**
   * Handle form edit lock updates
   */
  const handleLockUpdate = useCallback((payload: any) => {
    const { new: lock, eventType } = payload;
    
    // Only care about locks for current form
    if (!formId || lock.form_id !== formId) return;
    
    // Update collaborator status
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (lock.instance_id !== formLockService.getInstanceId()) {
        collaborators.current.set(lock.instance_id, {
          userId: lock.user_id,
          instanceId: lock.instance_id,
          lastSeen: new Date(lock.updated_at),
          isActive: new Date(lock.expires_at) > new Date()
        });
      }
    } else if (eventType === 'DELETE') {
      collaborators.current.delete(lock.instance_id);
    }
  }, [formId]);

  /**
   * Setup Supabase realtime subscriptions
   */
  useEffect(() => {
    if (!formId || !enabled) {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      return;
    }

    console.log('Setting up realtime sync for form:', formId);
    
    const channel = supabase.channel(`form-collaboration-${formId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forms',
          filter: `id=eq.${formId}`
        },
        (payload) => handleFormUpdate(payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_fields',
          filter: `form_id=eq.${formId}`
        },
        (payload) => handleFieldUpdate(payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_edit_locks',
          filter: `form_id=eq.${formId}`
        },
        (payload) => handleLockUpdate(payload)
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [formId, enabled, handleFormUpdate, handleFieldUpdate, handleLockUpdate]);

  /**
   * Setup cross-tab coordination
   */
  useEffect(() => {
    if (!formId) return;

    const handleTabFormUpdate = (message: any) => {
      if (message.formId === formId && message.data?.form) {
        updateFormSmart(message.data.form);
      }
    };

    const handleTabFieldUpdate = (message: any) => {
      if (message.formId === formId && message.data?.fieldId && message.data?.field) {
        updateField(message.data.fieldId, message.data.field);
      }
    };

    const handleSyncRequest = async (message: any) => {
      if (message.formId === formId) {
        // Respond with current form state using refs to avoid stale closures
        const syncMessage: TabMessage = {
          type: 'FORM_SYNC_RESPONSE',
          formId,
          data: { form: formRef.current, fields: fieldsRef.current },
          timestamp: Date.now(),
          tabId: tabCoordinationService.getTabId()
        };
        // Use the public interface instead
        (tabCoordinationService as any).channel.postMessage(syncMessage);
      }
    };

    tabCoordinationService.addMessageHandler('FORM_UPDATE', handleTabFormUpdate);
    tabCoordinationService.addMessageHandler('FIELD_UPDATE', handleTabFieldUpdate);
    tabCoordinationService.addMessageHandler('FORM_SYNC_REQUEST', handleSyncRequest);

    return () => {
      tabCoordinationService.removeMessageHandler('FORM_UPDATE', handleTabFormUpdate);
      tabCoordinationService.removeMessageHandler('FIELD_UPDATE', handleTabFieldUpdate);
      tabCoordinationService.removeMessageHandler('FORM_SYNC_REQUEST', handleSyncRequest);
    };
  }, [formId, updateFormSmart, updateField]); // Removed form and fields from dependencies

  /**
   * Update timestamp when we make changes
   */
  const updateTimestamp = useCallback(() => {
    lastUpdateTimestamp.current = Date.now();
  }, []);

  /**
   * Get active collaborators
   */
  const getActiveCollaborators = useCallback((): FormCollaborator[] => {
    const now = new Date();
    return Array.from(collaborators.current.values()).filter(
      collaborator => collaborator.isActive && (now.getTime() - collaborator.lastSeen.getTime()) < 5 * 60 * 1000
    );
  }, []);

  return {
    updateTimestamp,
    getActiveCollaborators,
    isRealtimeConnected: !!channelRef.current
  };
};