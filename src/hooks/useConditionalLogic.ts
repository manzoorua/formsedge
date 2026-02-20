import { useMemo, useCallback } from 'react';
import { FormField } from '../types/form';

export interface LogicCondition {
  id: string;
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
  logicOperator?: 'AND' | 'OR';
}

export interface ConditionalLogic {
  action: 'show' | 'hide';
  conditions: LogicCondition[];
}

export const useConditionalLogic = (fields: FormField[], formData: Record<string, any>, isBuilderMode: boolean = false) => {
  const evaluateCondition = useCallback((condition: LogicCondition): boolean => {
    const fieldValue = formData[condition.fieldId];
    const { operator, value } = condition;

    switch (operator) {
      case 'equals':
        return String(fieldValue || '') === value;
      case 'not_equals':
        return String(fieldValue || '') !== value;
      case 'contains':
        return String(fieldValue || '').toLowerCase().includes(value.toLowerCase());
      case 'greater_than':
        return Number(fieldValue || 0) > Number(value);
      case 'less_than':
        return Number(fieldValue || 0) < Number(value);
      case 'is_empty':
        return !fieldValue || String(fieldValue).trim() === '';
      case 'is_not_empty':
        return fieldValue && String(fieldValue).trim() !== '';
      default:
        return false;
    }
  }, [formData]);

  const evaluateLogic = useCallback((logic: ConditionalLogic): boolean => {
    if (!logic.conditions.length) return true;

    let result = evaluateCondition(logic.conditions[0]);

    for (let i = 1; i < logic.conditions.length; i++) {
      const condition = logic.conditions[i];
      const conditionResult = evaluateCondition(condition);
      
      if (logic.conditions[i - 1].logicOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return logic.action === 'show' ? result : !result;
  }, [evaluateCondition]);

  const getVisibleFields = useMemo(() => {
    // In builder mode, always show all fields
    if (isBuilderMode) {
      return fields;
    }
    
    return fields.filter(field => {
      // Fields without conditional logic should always be visible
      if (!field.logic_conditions) {
        return true;
      }
      
      // Handle invalid JSON gracefully
      try {
        const logic = JSON.parse(field.logic_conditions as string) as ConditionalLogic;
        return evaluateLogic(logic);
      } catch {
        return true;
      }
    });
  }, [fields, evaluateLogic, formData, isBuilderMode]);

  const isFieldVisible = useCallback((fieldId: string): boolean => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.logic_conditions) return true;
    
    try {
      const logic = JSON.parse(field.logic_conditions as string) as ConditionalLogic;
      return evaluateLogic(logic);
    } catch {
      return true;
    }
  }, [fields, evaluateLogic]);

  return {
    evaluateCondition,
    evaluateLogic,
    getVisibleFields,
    isFieldVisible
  };
};