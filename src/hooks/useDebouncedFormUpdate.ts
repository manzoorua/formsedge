import { useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { Form } from '../types/form';

interface UseDebouncedFormUpdateOptions {
  onFormUpdate: (form: Form) => void;
  delay?: number;
}

export const useDebouncedFormUpdate = ({ 
  onFormUpdate, 
  delay = 500 
}: UseDebouncedFormUpdateOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedUpdate = useCallback((form: Form) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout for the update
    timeoutRef.current = setTimeout(() => {
      
      onFormUpdate(form);
    }, delay);
  }, [onFormUpdate, delay]);
  
  // Immediate update for when user stops typing
  const immediateUpdate = useCallback((form: Form) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onFormUpdate(form);
  }, [onFormUpdate]);
  
  return {
    debouncedUpdate,
    immediateUpdate
  };
};