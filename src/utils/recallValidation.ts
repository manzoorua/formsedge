import { FormField } from '@/types/form';

export interface RecallValidationResult {
  isValid: boolean;
  warnings: string[];
}

export const validateRecallTokens = (
  text: string,
  fields: FormField[],
  urlParams: string[],
  currentFieldIndex?: number
): RecallValidationResult => {
  const warnings: string[] = [];
  const RECALL_REGEX = /\{\{\s*(field|param|hidden|var)\s*:\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  
  let match;
  while ((match = RECALL_REGEX.exec(text)) !== null) {
    const [fullMatch, kind, name] = match;
    
    if (kind === 'field' || kind === 'var') {
      const field = fields.find(f => f.ref === name);
      
      if (!field) {
        warnings.push(`Token ${fullMatch} references unknown field "${name}"`);
      } else if (currentFieldIndex !== undefined && field.order_index >= currentFieldIndex) {
        warnings.push(`Token ${fullMatch} references field "${field.label}" which appears later in form`);
      }
    }
    
    if (kind === 'param' || kind === 'hidden') {
      if (!urlParams.includes(name)) {
        warnings.push(`Token ${fullMatch} references undefined URL parameter "${name}"`);
      }
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
};

export const generateRef = (label: string, existingRefs: string[]): string => {
  let base = label
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 30);
  
  if (!base) base = 'field';
  
  // Ensure uniqueness
  let ref = base;
  let counter = 1;
  while (existingRefs.includes(ref)) {
    ref = `${base}_${counter}`;
    counter++;
  }
  
  return ref;
};
