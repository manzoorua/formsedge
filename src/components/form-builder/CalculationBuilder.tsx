import React, { useState } from 'react';
import { FormField } from '../../types/form';
import { CalculationFormula } from '../../hooks/useCalculations';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Calculator, Plus } from 'lucide-react';
import { useCalculations } from '../../hooks/useCalculations';

interface CalculationBuilderProps {
  field: FormField;
  fields: FormField[];
  onUpdate: (formula: CalculationFormula | null) => void;
}

export const CalculationBuilder: React.FC<CalculationBuilderProps> = ({
  field,
  fields,
  onUpdate
}) => {
  const [testData, setTestData] = useState<Record<string, number>>({});
  const { validateExpression, formatValue, formatResult } = useCalculations(fields, testData);
  
  const numericFields = fields.filter(f => 
    ['number', 'slider', 'rating'].includes(f.type) && f.id !== field.id
  );
  
  const formula: CalculationFormula = (() => {
    if (!field.calculations) {
      return { id: '', expression: '', format: 'number', decimalPlaces: 2 };
    }
    
    try {
      // Handle both string and object types
      if (typeof field.calculations === 'string') {
        return JSON.parse(field.calculations);
      } else if (typeof field.calculations === 'object') {
        return field.calculations as CalculationFormula;
      }
    } catch (error) {
      console.warn('Failed to parse calculations:', error, field.calculations);
    }
    
    return { id: '', expression: '', format: 'number', decimalPlaces: 2 };
  })();

  const updateFormula = (updates: Partial<CalculationFormula>) => {
    const newFormula = { ...formula, ...updates };
    onUpdate(newFormula.expression ? newFormula : null);
  };

  const insertField = (fieldId: string) => {
    const fieldToInsert = fields.find(f => f.id === fieldId);
    if (!fieldToInsert) return;
    
    const currentExpression = formula.expression || '';
    const newExpression = currentExpression + `{${fieldToInsert.label}}`;
    updateFormula({ expression: newExpression });
  };

  const insertOperator = (operator: string) => {
    const currentExpression = formula.expression || '';
    const newExpression = currentExpression + ` ${operator} `;
    updateFormula({ expression: newExpression });
  };

  const validation = validateExpression(formula.expression || '');
  
  const testResult = formula.expression 
    ? formatResult(
        validation.isValid ? 
          Function(`"use strict"; return (${formula.expression.replace(/\{[^}]+\}/g, '10')})`)() : 0,
        formula.format,
        formula.decimalPlaces
      )
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Calculations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Formula</Label>
          <Input
            value={formula.expression || ''}
            onChange={(e) => updateFormula({ expression: e.target.value })}
            placeholder="e.g., {Quantity} * {Price} + {Tax}"
            className={validation.isValid ? '' : 'border-destructive'}
          />
          {!validation.isValid && validation.error && (
            <p className="text-sm text-destructive">{validation.error}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Available Fields</Label>
          <div className="flex flex-wrap gap-1">
            {numericFields.map(f => (
              <Badge
                key={f.id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => insertField(f.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {f.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Operators</Label>
          <div className="flex gap-1">
            {['+', '-', '*', '/', '(', ')'].map(op => (
              <Button
                key={op}
                variant="outline"
                size="sm"
                onClick={() => insertOperator(op)}
                className="w-8 h-8 p-0"
              >
                {op}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Format</Label>
            <Select
              value={formula.format || 'number'}
              onValueChange={(value: CalculationFormula['format']) => 
                updateFormula({ format: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Decimal Places</Label>
            <Select
              value={String(formula.decimalPlaces || 2)}
              onValueChange={(value) => updateFormula({ decimalPlaces: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formula.expression && validation.isValid && (
          <div className="p-3 bg-muted rounded-md">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <p className="text-sm font-medium">{testResult}</p>
            <p className="text-xs text-muted-foreground">
              (with sample values of 10 for each field)
            </p>
          </div>
        )}

        {formula.expression && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate(null)}
            className="w-full text-destructive"
          >
            Clear Formula
          </Button>
        )}
      </CardContent>
    </Card>
  );
};