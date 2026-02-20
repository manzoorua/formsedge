import React from 'react';
import { Form } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isValidParamName, isReservedParam, FormUrlParamConfig } from '@/lib/urlParamValidation';

interface UrlParametersSettingsProps {
  form: Form;
  onUpdate: (form: Form) => void;
}

export const UrlParametersSettings: React.FC<UrlParametersSettingsProps> = ({ form, onUpdate }) => {
  const params = (form.url_params_config || []) as FormUrlParamConfig[];
  
  const addParameter = () => {
    const newParam: FormUrlParamConfig = {
      name: '',
      label: '',
      description: '',
      include_in_responses: true,
      visible_in_exports: true,
      default_value: '',
      transitive_default: false,
    };
    
    onUpdate({
      ...form,
      url_params_config: [...params, newParam] as any,
    });
  };
  
  const updateParameter = (index: number, updates: Partial<FormUrlParamConfig>) => {
    const updated = [...params];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ ...form, url_params_config: updated as any });
  };
  
  const removeParameter = (index: number) => {
    const updated = params.filter((_, i) => i !== index);
    onUpdate({ ...form, url_params_config: updated as any });
  };
  
  const validateParamName = (name: string, currentIndex: number): string | null => {
    if (!name) return 'Parameter name is required';
    if (!isValidParamName(name)) {
      if (isReservedParam(name)) {
        return `"${name}" is a reserved parameter name`;
      }
      return 'Use only letters, numbers, and underscores';
    }
    
    // Check for duplicates
    const duplicate = params.findIndex((p, i) => i !== currentIndex && p.name === name);
    if (duplicate !== -1) {
      return 'Parameter name must be unique';
    }
    
    return null;
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">URL Parameters & Hidden Data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Define parameters that can be passed via URL or embed code to capture additional context with each response.
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Parameters can be set statically in embed code or passed dynamically from the page URL (transitive).
          Use these to capture UTM parameters, user IDs, or any contextual data.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        {params.map((param, index) => {
          const error = validateParamName(param.name, index);
          
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {param.name || `Parameter ${index + 1}`}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParameter(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor={`param-name-${index}`}>
                    Parameter Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`param-name-${index}`}
                    value={param.name}
                    onChange={(e) => updateParameter(index, { name: e.target.value })}
                    placeholder="e.g., user_id, utm_source"
                    className={error ? 'border-destructive' : ''}
                  />
                  {error && (
                    <p className="text-sm text-destructive mt-1">{error}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`param-label-${index}`}>Label (Optional)</Label>
                  <Input
                    id={`param-label-${index}`}
                    value={param.label || ''}
                    onChange={(e) => updateParameter(index, { label: e.target.value })}
                    placeholder="Human-readable label"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`param-desc-${index}`}>Description (Optional)</Label>
                  <Textarea
                    id={`param-desc-${index}`}
                    value={param.description || ''}
                    onChange={(e) => updateParameter(index, { description: e.target.value })}
                    placeholder="What is this parameter used for?"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`param-default-${index}`}>Default Value (Optional)</Label>
                  <Input
                    id={`param-default-${index}`}
                    value={param.default_value || ''}
                    onChange={(e) => updateParameter(index, { default_value: e.target.value })}
                    placeholder="Default value if not provided"
                  />
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`param-in-response-${index}`}>
                      Include in responses
                    </Label>
                    <Checkbox
                      id={`param-in-response-${index}`}
                      checked={param.include_in_responses !== false}
                      onCheckedChange={(checked) => 
                        updateParameter(index, { include_in_responses: checked as boolean })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`param-in-export-${index}`}>
                      Visible in exports
                    </Label>
                    <Checkbox
                      id={`param-in-export-${index}`}
                      checked={param.visible_in_exports !== false}
                      onCheckedChange={(checked) => 
                        updateParameter(index, { visible_in_exports: checked as boolean })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Button onClick={addParameter} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Parameter
      </Button>
    </div>
  );
};
