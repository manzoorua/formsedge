import { useMemo } from 'react';
import { FormField } from '../types/form';
import { create, all } from 'mathjs';

export interface CalculationFormula {
  id: string;
  expression: string;
  format?: 'number' | 'currency' | 'percentage';
  decimalPlaces?: number;
}

export const useCalculations = (fields: FormField[], formData: Record<string, any>) => {
  
  const calculateValue = useMemo(() => {
    return (formula: CalculationFormula) => {
      try {
        let processedExpression = formula.expression;
        
        // Find all field references in the expression
        const fieldReferences = processedExpression.match(/\{[^}]+\}/g) || [];
        
        // Replace field references with actual values
        for (const ref of fieldReferences) {
          const fieldName = ref.slice(1, -1); // Remove { and }
          
          // Try to find field by id first, then by label
          const field = fields.find(f => f.id === fieldName || f.label === fieldName);
          const value = field ? (formData[field.id] || 0) : 0;
          
          // Convert to number, default to 0 if invalid
          const numericValue = Number(value) || 0;
          processedExpression = processedExpression.replace(ref, numericValue.toString());
        }
        
        // Use mathjs for secure mathematical expression evaluation
        try {
          const math = create(all);
          const result = math.evaluate(processedExpression);
          return typeof result === 'number' && isFinite(result) ? result : 0;
        } catch (error) {
          console.warn('Calculation error:', error);
          return 0;
        }
      } catch (error) {
        console.error('Calculation error:', error);
        return 0;
      }
    };
  }, [fields, formData]);

  const formatResult = useMemo(() => {
    return (value: number, format?: 'number' | 'currency' | 'percentage', decimalPlaces = 2) => {
      if (!isFinite(value)) return '0';
      
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(value);
        case 'percentage':
          return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(value / 100);
        default:
          return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(value);
      }
    };
  }, []);

  // Legacy compatibility methods
  const validateExpression = useCalculationValidation(fields);
  
  const formatValue = (value: number, formula: CalculationFormula) => {
    return formatResult(value, formula.format, formula.decimalPlaces);
  };
  
  const calculateField = (field: FormField) => {
    if (field.calculations?.length) {
      const formula: CalculationFormula = {
        id: field.id,
        expression: field.calculations[0].expression,
        format: field.calculations[0].format as any,
        decimalPlaces: field.calculations[0].decimalPlaces
      };
      return calculateValue(formula);
    }
    return 0;
  };

  return {
    calculateValue,
    formatResult,
    validateExpression,
    formatValue,
    calculateField,
  };
};

export const useCalculationValidation = (fields: FormField[]) => {
  return useMemo(() => {
    return (expression: string) => {
      if (!expression.trim()) {
        return { isValid: false, error: 'Expression cannot be empty' };
      }
      
      // Check for balanced parentheses
      let openCount = 0;
      for (const char of expression) {
        if (char === '(') openCount++;
        if (char === ')') openCount--;
        if (openCount < 0) {
          return { isValid: false, error: 'Unmatched closing parenthesis' };
        }
      }
      
      if (openCount > 0) {
        return { isValid: false, error: 'Unmatched opening parenthesis' };
      }
      
      // Find all field references
      const fieldReferences = expression.match(/\{[^}]+\}/g) || [];
      
      // Validate that all referenced fields exist
      for (const ref of fieldReferences) {
        const fieldName = ref.slice(1, -1);
        const field = fields.find(f => f.id === fieldName || f.label === fieldName);
        if (!field) {
          return { isValid: false, error: `Field "${fieldName}" not found` };
        }
        
        // Check if field type is numeric
        const numericTypes = ['number', 'range', 'rating'];
        if (!numericTypes.includes(field.type)) {
          return { isValid: false, error: `Field "${fieldName}" is not a numeric field` };
        }
      }
      
      // Replace field references with test values for validation
      let testExpression = expression;
      for (const ref of fieldReferences) {
        testExpression = testExpression.replace(ref, '1');
      }
      
      // Validate using mathjs
      try {
        const math = create(all);
        const result = math.evaluate(testExpression);
        if (typeof result !== 'number' || !isFinite(result)) {
          return { isValid: false, error: 'Expression must evaluate to a valid number' };
        }
        
        return { isValid: true };
      } catch (error) {
        return { isValid: false, error: 'Invalid mathematical expression' };
      }
    };
  }, [fields]);
};