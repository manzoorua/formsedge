import React from 'react';
import { FormField } from '../../types/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ShieldCheck } from 'lucide-react';

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'fileSize' | 'fileTypes';
  value?: string | number;
  message?: string;
}

interface ValidationBuilderProps {
  field: FormField;
  onUpdate: (rules: ValidationRule[]) => void;
}

export const ValidationBuilder: React.FC<ValidationBuilderProps> = ({
  field,
  onUpdate
}) => {
  const rules: ValidationRule[] = (() => {
    if (!field.validation_rules) return [];
    
    // Handle both string and object formats safely
    if (typeof field.validation_rules === 'string') {
      try {
        return JSON.parse(field.validation_rules);
      } catch (error) {
        console.warn('Failed to parse validation_rules as JSON:', error);
        return [];
      }
    }
    
    // If it's already an object/array, return it directly
    return Array.isArray(field.validation_rules) ? field.validation_rules : [];
  })();

  const updateRules = (newRules: ValidationRule[]) => {
    onUpdate(newRules);
  };

  const updateRule = (type: ValidationRule['type'], updates: Partial<ValidationRule>) => {
    const existingRuleIndex = rules.findIndex(r => r.type === type);
    const newRules = [...rules];
    
    if (existingRuleIndex >= 0) {
      newRules[existingRuleIndex] = { ...newRules[existingRuleIndex], ...updates };
    } else {
      newRules.push({ type, ...updates });
    }
    
    updateRules(newRules);
  };

  const removeRule = (type: ValidationRule['type']) => {
    updateRules(rules.filter(r => r.type !== type));
  };

  const getRuleValue = (type: ValidationRule['type']) => {
    return rules.find(r => r.type === type);
  };

  const hasRule = (type: ValidationRule['type']) => {
    return rules.some(r => r.type === type);
  };

  const isNumberField = ['number', 'slider', 'rating'].includes(field.type);
  const isTextField = ['text', 'textarea', 'email', 'phone', 'url'].includes(field.type);
  const isFileField = field.type === 'file';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Validation Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Field */}
        <div className="flex items-center justify-between">
          <Label>Required Field</Label>
          <Switch
            checked={hasRule('required')}
            onCheckedChange={(checked) => {
              if (checked) {
                updateRule('required', { message: 'This field is required' });
              } else {
                removeRule('required');
              }
            }}
          />
        </div>
        
        {hasRule('required') && (
          <div className="ml-4 space-y-2">
            <Label className="text-xs">Custom Error Message</Label>
            <Input
              value={getRuleValue('required')?.message || ''}
              onChange={(e) => updateRule('required', { message: e.target.value })}
              placeholder="This field is required"
            />
          </div>
        )}

        {/* Text Length Validation */}
        {isTextField && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Minimum Length</Label>
                <Switch
                  checked={hasRule('minLength')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateRule('minLength', { value: 1, message: 'Text is too short' });
                    } else {
                      removeRule('minLength');
                    }
                  }}
                />
              </div>
              
              {hasRule('minLength') && (
                <div className="ml-4 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Characters</Label>
                    <Input
                      type="number"
                      value={getRuleValue('minLength')?.value || ''}
                      onChange={(e) => updateRule('minLength', { value: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Error Message</Label>
                    <Input
                      value={getRuleValue('minLength')?.message || ''}
                      onChange={(e) => updateRule('minLength', { message: e.target.value })}
                      placeholder="Text is too short"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Maximum Length</Label>
                <Switch
                  checked={hasRule('maxLength')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateRule('maxLength', { value: 100, message: 'Text is too long' });
                    } else {
                      removeRule('maxLength');
                    }
                  }}
                />
              </div>
              
              {hasRule('maxLength') && (
                <div className="ml-4 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Characters</Label>
                    <Input
                      type="number"
                      value={getRuleValue('maxLength')?.value || ''}
                      onChange={(e) => updateRule('maxLength', { value: Number(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Error Message</Label>
                    <Input
                      value={getRuleValue('maxLength')?.message || ''}
                      onChange={(e) => updateRule('maxLength', { message: e.target.value })}
                      placeholder="Text is too long"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Number Range Validation */}
        {isNumberField && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Minimum Value</Label>
                <Switch
                  checked={hasRule('min')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateRule('min', { value: 0, message: 'Value is too low' });
                    } else {
                      removeRule('min');
                    }
                  }}
                />
              </div>
              
              {hasRule('min') && (
                <div className="ml-4 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Value</Label>
                    <Input
                      type="number"
                      value={getRuleValue('min')?.value || ''}
                      onChange={(e) => updateRule('min', { value: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Error Message</Label>
                    <Input
                      value={getRuleValue('min')?.message || ''}
                      onChange={(e) => updateRule('min', { message: e.target.value })}
                      placeholder="Value is too low"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Maximum Value</Label>
                <Switch
                  checked={hasRule('max')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateRule('max', { value: 100, message: 'Value is too high' });
                    } else {
                      removeRule('max');
                    }
                  }}
                />
              </div>
              
              {hasRule('max') && (
                <div className="ml-4 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Value</Label>
                    <Input
                      type="number"
                      value={getRuleValue('max')?.value || ''}
                      onChange={(e) => updateRule('max', { value: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Error Message</Label>
                    <Input
                      value={getRuleValue('max')?.message || ''}
                      onChange={(e) => updateRule('max', { message: e.target.value })}
                      placeholder="Value is too high"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Pattern Validation */}
        {isTextField && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Custom Pattern</Label>
              <Switch
                checked={hasRule('pattern')}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateRule('pattern', { value: '', message: 'Invalid format' });
                  } else {
                    removeRule('pattern');
                  }
                }}
              />
            </div>
            
            {hasRule('pattern') && (
              <div className="ml-4 space-y-2">
                <div>
                  <Label className="text-xs">Regex Pattern</Label>
                  <Input
                    value={getRuleValue('pattern')?.value || ''}
                    onChange={(e) => updateRule('pattern', { value: e.target.value })}
                    placeholder="^[A-Za-z0-9]+$"
                  />
                </div>
                <div>
                  <Label className="text-xs">Error Message</Label>
                  <Input
                    value={getRuleValue('pattern')?.message || ''}
                    onChange={(e) => updateRule('pattern', { message: e.target.value })}
                    placeholder="Invalid format"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Validation */}
        {isFileField && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>File Size Limit</Label>
                <Switch
                  checked={hasRule('fileSize')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateRule('fileSize', { value: 5, message: 'File is too large' });
                    } else {
                      removeRule('fileSize');
                    }
                  }}
                />
              </div>
              
              {hasRule('fileSize') && (
                <div className="ml-4 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Size (MB)</Label>
                    <Input
                      type="number"
                      value={getRuleValue('fileSize')?.value || ''}
                      onChange={(e) => updateRule('fileSize', { value: Number(e.target.value) })}
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Error Message</Label>
                    <Input
                      value={getRuleValue('fileSize')?.message || ''}
                      onChange={(e) => updateRule('fileSize', { message: e.target.value })}
                      placeholder="File is too large"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Allowed File Types</Label>
                <Switch
                  checked={hasRule('fileTypes')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateRule('fileTypes', { value: 'jpg,png,pdf', message: 'File type not allowed' });
                    } else {
                      removeRule('fileTypes');
                    }
                  }}
                />
              </div>
              
              {hasRule('fileTypes') && (
                <div className="ml-4 space-y-2">
                  <div>
                    <Label className="text-xs">Extensions (comma-separated)</Label>
                    <Input
                      value={getRuleValue('fileTypes')?.value || ''}
                      onChange={(e) => updateRule('fileTypes', { value: e.target.value })}
                      placeholder="jpg,png,pdf,doc,docx"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Error Message</Label>
                    <Input
                      value={getRuleValue('fileTypes')?.message || ''}
                      onChange={(e) => updateRule('fileTypes', { message: e.target.value })}
                      placeholder="File type not allowed"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};