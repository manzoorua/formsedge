import React from 'react';
import { FormField } from '../../types/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { ConditionalLogicBuilder } from './ConditionalLogicBuilder';
import { CalculationBuilder } from './CalculationBuilder';
import { ValidationBuilder } from './ValidationBuilder';
import { FieldLayoutControls } from './FieldLayoutControls';
import { RecallTextInput } from './RecallTextInput';

interface FieldSettingsProps {
  field: FormField | null;
  fields: FormField[];
  onUpdate: (updates: Partial<FormField>) => void;
}

export const FieldSettings: React.FC<FieldSettingsProps> = ({
  field,
  fields,
  onUpdate,
}) => {

  if (!field) {
    return (
      <div 
        className="h-full rounded-none border-0 relative overflow-hidden"
        style={{
          background: 'var(--gradient-settings-card)',
          boxShadow: 'var(--shadow-settings-card)'
        }}
      >
        <div 
          className="px-6 py-5 border-b border-border/30 relative overflow-hidden"
          style={{
            background: 'var(--gradient-settings-header)',
            boxShadow: 'var(--shadow-settings-elevated)'
          }}
        >
          <div className="relative z-10">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Field Settings
            </h3>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40" />
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-96 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
              </div>
              <p className="text-muted-foreground font-medium">No field selected</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Click on a field in the form to edit its settings
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasOptions = ['checkbox', 'radio', 'select'].includes(field.type);
  const options = (field.options as string[]) || [];

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    onUpdate({ options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div 
      className="h-full rounded-none border-0 relative overflow-hidden"
      style={{
        background: 'var(--gradient-settings-card)',
        boxShadow: 'var(--shadow-settings-card)'
      }}
    >
      <div 
        className="px-6 py-5 border-b border-border/30 relative overflow-hidden"
        style={{
          background: 'var(--gradient-settings-header)',
          boxShadow: 'var(--shadow-settings-elevated)'
        }}
      >
        <div className="relative z-10">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Field Settings
          </h3>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40" />
        </div>
      </div>
      <div className="p-0">
        <ScrollArea className="h-[calc(100vh-9rem)]">
          <div className="p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="validation">Validate</TabsTrigger>
            <TabsTrigger value="logic">Logic</TabsTrigger>
            <TabsTrigger value="calculations">Math</TabsTrigger>
          </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                {/* Field Label */}
                <RecallTextInput
                  label="Field Label"
                  id="field-label"
                  value={field.label}
                  onChange={(value) => onUpdate({ label: value })}
                  fields={fields}
                  placeholder="Enter field label"
                  hint="Use Recall tokens like {{field:name}} or {{param:source}}"
                />

                {/* Field Description */}
                <RecallTextInput
                  label="Description"
                  id="field-description"
                  value={field.description || ''}
                  onChange={(value) => onUpdate({ description: value })}
                  fields={fields}
                  multiline
                  placeholder="Optional description or help text"
                  hint="Add help text with dynamic values using Recall"
                />

                {/* Placeholder */}
                {!['checkbox', 'radio', 'file', 'rating', 'divider', 'html'].includes(field.type) && (
                  <RecallTextInput
                    label="Placeholder"
                    id="field-placeholder"
                    value={field.placeholder || ''}
                    onChange={(value) => onUpdate({ placeholder: value })}
                    fields={fields}
                    placeholder="Enter placeholder text"
                  />
                )}
                
                {/* Reference Key (Advanced) */}
                <Separator />
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="field-ref" className="text-sm font-medium">
                      Reference Key (Advanced)
                    </Label>
                    <Badge variant="outline" className="text-xs">Recall</Badge>
                  </div>
                  <Input
                    id="field-ref"
                    value={field.ref || ''}
                    onChange={(e) => {
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, '_')
                        .replace(/^_+|_+$/g, '');
                      onUpdate({ ref: value || undefined });
                    }}
                    placeholder="e.g., full_name, company, rating"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use in Recall as <code className="px-1 py-0.5 bg-background rounded">{'{{field:' + (field.ref || 'your_ref') + '}}'}</code>
                  </p>
                  {!field.ref && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      💡 Tip: Set this to reference field values in labels, descriptions, or thank-you text
                    </p>
                  )}
                </div>

                {/* Required Toggle */}
                {field.type !== 'divider' && field.type !== 'html' && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="field-required">Required Field</Label>
                        <p className="text-xs text-muted-foreground">
                          Make this field mandatory
                        </p>
                      </div>
                      <Switch
                        id="field-required"
                        checked={field.required}
                        onCheckedChange={(checked) => onUpdate({ required: checked })}
                      />
                    </div>
                  </>
                )}

                {/* Options for choice fields */}
                {hasOptions && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                              disabled={options.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <FieldLayoutControls field={field} onUpdate={onUpdate} />
          </TabsContent>

              {/* Validation Rules */}
              <TabsContent value="validation" className="space-y-4 mt-4">
                <ValidationBuilder 
                  field={field}
                  onUpdate={(rules) => {
                    try {
                      // Ensure we only serialize plain objects
                      const safeRules = rules?.map(rule => ({
                        type: rule.type,
                        value: rule.value,
                        message: rule.message
                      })) || [];
                      
                      const serialized = JSON.stringify(safeRules);
                      onUpdate({ validation_rules: serialized });
                    } catch (error) {
                      console.warn('Failed to serialize validation rules:', error, rules);
                      // Fallback to empty array if serialization fails
                      onUpdate({ validation_rules: JSON.stringify([]) });
                    }
                  }}
                />
              </TabsContent>

              {/* Conditional Logic */}
              <TabsContent value="logic" className="space-y-4 mt-4">
                <ConditionalLogicBuilder
                  field={field}
                  fields={fields}
                  onUpdate={(logic) => onUpdate({ logic_conditions: logic ? JSON.stringify(logic) : null })}
                />
              </TabsContent>
              
              {/* Calculations */}
              <TabsContent value="calculations" className="space-y-4 mt-4">
                <CalculationBuilder
                  field={field}
                  fields={fields}
                  onUpdate={(formula) => onUpdate({ calculations: formula ? JSON.stringify(formula) : null })}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};