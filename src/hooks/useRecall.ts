import { useMemo } from 'react';
import { FormField } from '@/types/form';

const RECALL_REGEX = /\{\{\s*(field|param|hidden|var)\s*:\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export interface RecallContext {
  answersByRef: Record<string, string>;
  urlParams: Record<string, string>;
  variables: Record<string, string | number>;
}

export const useRecall = (
  fields: FormField[],
  responses: Record<string, any>,
  urlParams: Record<string, string>
) => {
  // Build answersByRef map
  const answersByRef = useMemo(() => {
    const map: Record<string, string> = {};
    
    fields.forEach(field => {
      if (!field.ref) return;
      
      const raw = responses[field.id];
      if (raw === undefined || raw === null || raw === '') return;

      let val: string;
      if (typeof raw === 'string') {
        val = raw;
      } else if (Array.isArray(raw)) {
        val = raw.join(', ');
      } else if (typeof raw === 'number' || typeof raw === 'boolean') {
        val = String(raw);
      } else {
        val = JSON.stringify(raw);
      }

      map[field.ref] = val;
    });
    
    return map;
  }, [fields, responses]);

  // Build variables map (calculated fields)
  const variables = useMemo(() => {
    const vars: Record<string, string | number> = {};
    
    fields.forEach(field => {
      if (field.type !== 'calculated') return;
      if (!field.ref) return;
      
      const raw = responses[field.id];
      if (raw === undefined || raw === null || raw === '') return;
      
      vars[field.ref] = raw;
    });
    
    return vars;
  }, [fields, responses]);

  // Create recall context
  const context: RecallContext = useMemo(() => ({
    answersByRef,
    urlParams,
    variables,
  }), [answersByRef, urlParams, variables]);

  // Resolver function
  const resolveRecall = useMemo(() => {
    return (template: string | null | undefined): string => {
      if (!template) return '';
      
      return template.replace(RECALL_REGEX, (match, kind: string, name: string) => {
        switch (kind) {
          case 'field':
            return context.answersByRef[name] ?? '';
          case 'param':
          case 'hidden':
            return context.urlParams[name] ?? '';
          case 'var': {
            const v = context.variables[name];
            return v == null ? '' : String(v);
          }
          default:
            return '';
        }
      });
    };
  }, [context]);

  return {
    resolveRecall,
    context,
  };
};
