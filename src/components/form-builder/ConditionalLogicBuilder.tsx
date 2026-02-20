import React from 'react';
import { FormField } from '../../types/form';
import { LogicCondition, ConditionalLogic } from '../../hooks/useConditionalLogic';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ConditionalLogicBuilderProps {
  field: FormField;
  fields: FormField[];
  onUpdate: (logic: ConditionalLogic | null) => void;
}

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' }
];

export const ConditionalLogicBuilder: React.FC<ConditionalLogicBuilderProps> = ({
  field,
  fields,
  onUpdate
}) => {
  const availableFields = fields.filter(f => f.id !== field.id);
  
  const logic: ConditionalLogic = (() => {
    if (!field.logic_conditions) {
      return { action: 'show', conditions: [] };
    }
    
    try {
      // Handle both string and object types
      if (typeof field.logic_conditions === 'string') {
        return JSON.parse(field.logic_conditions);
      } else if (typeof field.logic_conditions === 'object') {
        return field.logic_conditions as ConditionalLogic;
      }
    } catch (error) {
      console.warn('Failed to parse logic conditions:', error, field.logic_conditions);
    }
    
    return { action: 'show', conditions: [] };
  })();

  const updateLogic = (updates: Partial<ConditionalLogic>) => {
    const newLogic = { ...logic, ...updates };
    onUpdate(newLogic.conditions.length > 0 ? newLogic : null);
  };

  const addCondition = () => {
    const newCondition: LogicCondition = {
      id: uuidv4(),
      fieldId: '',
      operator: 'equals',
      value: '',
      logicOperator: logic.conditions.length > 0 ? 'AND' : undefined
    };
    
    updateLogic({
      conditions: [...logic.conditions, newCondition]
    });
  };

  const updateCondition = (index: number, updates: Partial<LogicCondition>) => {
    const newConditions = [...logic.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    updateLogic({ conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = logic.conditions.filter((_, i) => i !== index);
    updateLogic({ conditions: newConditions });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Conditional Logic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select
            value={logic.action}
            onValueChange={(value: 'show' | 'hide') => updateLogic({ action: value })}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="show">Show</SelectItem>
              <SelectItem value="hide">Hide</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">this field if:</span>
        </div>

        {logic.conditions.map((condition, index) => (
          <div key={condition.id} className="space-y-2">
            {index > 0 && (
              <div className="flex items-center gap-2">
                <Select
                  value={logic.conditions[index - 1].logicOperator || 'AND'}
                  onValueChange={(value: 'AND' | 'OR') => 
                    updateCondition(index - 1, { logicOperator: value })
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Select
                value={condition.fieldId}
                onValueChange={(value) => updateCondition(index, { fieldId: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={condition.operator}
                onValueChange={(value: LogicCondition['operator']) => 
                  updateCondition(index, { operator: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map(op => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                <Input
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1"
                />
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCondition(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={addCondition}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
        
        {logic.conditions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate(null)}
            className="w-full text-destructive"
          >
            Clear All Conditions
          </Button>
        )}
      </CardContent>
    </Card>
  );
};