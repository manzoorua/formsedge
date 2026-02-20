import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export const useFormNavigation = () => {
  const navigate = useNavigate();
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  });

  const navigateToFormWithSave = useCallback(async (
    newFormId: string, 
    currentForm: any, 
    saveForm: () => Promise<void>,
    flushDebounced?: () => void
  ) => {
    if (saveState.isSaving) {
      toast.error('Save in progress, please wait...');
      return;
    }

    setSaveState(prev => ({ ...prev, isSaving: true }));
    
    let saveAttempts = 0;
    const maxRetries = 3;
    
    const saveWithRetry = async (): Promise<boolean> => {
      while (saveAttempts < maxRetries) {
        try {
          saveAttempts++;
          
          // Flush any pending debounced changes
          if (flushDebounced) {
            flushDebounced();
          }
          
          // Show progress feedback
          if (saveAttempts === 1) {
            toast.loading('Saving current form...', { id: 'form-save' });
          } else {
            toast.loading(`Saving... (Attempt ${saveAttempts}/${maxRetries})`, { id: 'form-save' });
          }
          
          await saveForm();
          
          toast.success('Form saved successfully', { id: 'form-save' });
          setSaveState(prev => ({ 
            ...prev, 
            lastSaved: new Date(), 
            hasUnsavedChanges: false 
          }));
          
          return true;
        } catch (error) {
          console.error(`Save attempt ${saveAttempts} failed:`, error);
          
          if (saveAttempts >= maxRetries) {
            toast.error(
              `Failed to save after ${maxRetries} attempts. Navigation cancelled.`,
              { id: 'form-save' }
            );
            return false;
          }
          
          // Brief delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      return false;
    };

    try {
      const saveSuccess = await saveWithRetry();
      
      if (saveSuccess) {
        toast.loading('Switching forms...', { id: 'form-navigation' });
        
        // Navigate to new form
        navigate(`/form-builder/${newFormId}`);
        
        toast.success('Form switched successfully', { id: 'form-navigation' });
      }
    } catch (error) {
      console.error('Error during navigation:', error);
      toast.error('Navigation failed');
    } finally {
      setSaveState(prev => ({ ...prev, isSaving: false }));
    }
  }, [navigate, saveState.isSaving]);

  const markUnsavedChanges = useCallback(() => {
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  const markSaved = useCallback(() => {
    setSaveState(prev => ({ 
      ...prev, 
      hasUnsavedChanges: false, 
      lastSaved: new Date() 
    }));
  }, []);

  return {
    navigateToFormWithSave,
    saveState,
    markUnsavedChanges,
    markSaved
  };
};