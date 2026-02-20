import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { supabase } from '@/integrations/supabase/client';

interface UseAutoSaveOptions {
  interval: number; // milliseconds
  hasUnsavedChanges: boolean;
  onSave: () => Promise<void>;
  enabled: boolean;
  formId?: string; // Add form ID for conflict detection
}

interface SaveConflict {
  hasConflict: boolean;
  conflictData?: any;
  lastModified?: Date;
}

export const useAutoSave = ({ interval, hasUnsavedChanges, onSave, enabled, formId }: UseAutoSaveOptions) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);
  const lastKnownVersion = useRef<string>('');
  
  // Debounce the unsaved changes to avoid too frequent auto-saves
  const debouncedHasChanges = useDebounce(hasUnsavedChanges, 2000);

  /**
   * Check for save conflicts before auto-saving
   */
  const checkForConflicts = async (): Promise<SaveConflict> => {
    if (!formId) return { hasConflict: false };

    try {
      const { data: currentForm, error } = await supabase
        .from('forms')
        .select('updated_at')
        .eq('id', formId)
        .single();

      if (error || !currentForm) {
        return { hasConflict: false };
      }

      const serverVersion = currentForm.updated_at;
      const hasConflict = lastKnownVersion.current && 
                         lastKnownVersion.current !== serverVersion;

      return {
        hasConflict,
        lastModified: new Date(serverVersion),
        conflictData: hasConflict ? currentForm : undefined
      };
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return { hasConflict: false };
    }
  };

  /**
   * Enhanced auto-save with conflict detection
   */
  const performSaveWithConflictCheck = async () => {
    try {
      // Check for conflicts before saving
      const conflict = await checkForConflicts();
      
      if (conflict.hasConflict) {
        console.warn('Save conflict detected, skipping auto-save', {
          lastKnown: lastKnownVersion.current,
          serverVersion: conflict.lastModified
        });
        
        // Could emit event here for UI to show conflict resolution dialog
        return;
      }

      await onSave();
      lastSaveRef.current = Date.now();
      
      // Update last known version after successful save
      if (formId) {
        const { data: updatedForm } = await supabase
          .from('forms')
          .select('updated_at')
          .eq('id', formId)
          .single();
        
        if (updatedForm) {
          lastKnownVersion.current = updatedForm.updated_at;
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  useEffect(() => {
    if (!enabled || !debouncedHasChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = undefined;
      }
      return;
    }

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveRef.current;
    const timeUntilNextSave = Math.max(0, interval - timeSinceLastSave);

    // Prevent auto-save too soon after any save (avoid save loops)
    if (timeSinceLastSave < 5000) { // Increased to 5 seconds
      return;
    }

    saveTimeoutRef.current = setTimeout(performSaveWithConflictCheck, timeUntilNextSave);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = undefined;
      }
    };
  }, [debouncedHasChanges, interval, enabled, formId]);

  // Manual trigger for immediate save with cleanup and conflict check
  const saveNow = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
    }
    
    await performSaveWithConflictCheck();
  };

  /**
   * Update the known version after external updates
   */
  const updateKnownVersion = (version: string) => {
    lastKnownVersion.current = version;
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { 
    saveNow, 
    updateKnownVersion,
    checkForConflicts 
  };
};