import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FormTemplate } from '../../types/form';
import { FieldRenderer } from '../form-builder/FieldRenderer';
import { Smartphone, Monitor, Eye, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface TemplatePreviewProps {
  template: FormTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: (template: FormTemplate) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onUseTemplate
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!template) return null;

  const templateData = template.template_data as any;
  const form = templateData.form || {};
  const fields = templateData.fields || [];
  
  // Extract Recall features
  const hasRecall = template.tags?.includes('recall');
  const recallTokenPattern = /\{\{(field|param|var|hidden):([^}]+)\}\}/g;
  
  const fieldRefs = fields
    .filter((f: any) => f.ref)
    .map((f: any) => f.ref);
  
  const urlParams = templateData.url_params_config || [];
  
  const recallTokensUsed = new Set<string>();
  
  // Scan all text content for Recall tokens
  const scanForTokens = (text: string) => {
    if (!text) return;
    const matches = text.matchAll(recallTokenPattern);
    for (const match of matches) {
      recallTokensUsed.add(`{{${match[1]}:${match[2]}}}`);
    }
  };
  
  // Scan form settings
  scanForTokens(form.title);
  scanForTokens(form.description);
  scanForTokens(form.thank_you_message);
  scanForTokens(form.redirect_url);
  
  // Scan all fields
  fields.forEach((field: any) => {
    scanForTokens(field.label);
    scanForTokens(field.description);
    scanForTokens(field.placeholder);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{template.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{template.category}</Badge>
            {template.tags?.includes('recall') && (
              <Badge variant="secondary" className="bg-gradient-primary text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Recall Enabled
              </Badge>
            )}
            {template.tags?.filter(tag => tag !== 'recall').map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Recall Features Section */}
          {hasRecall && recallTokensUsed.size > 0 && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-primary">Recall Features Used</h3>
              </div>
              <div className="space-y-3 text-sm">
                {fieldRefs.length > 0 && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Field References:</p>
                    <div className="flex flex-wrap gap-1">
                      {fieldRefs.map((ref: string) => (
                        <Badge key={ref} variant="outline" className="text-xs font-mono bg-background">
                          {`{{field:${ref}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {urlParams.length > 0 && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">URL Parameters:</p>
                    <div className="flex flex-wrap gap-1">
                      {urlParams.map((param: any) => (
                        <Badge key={param.name} variant="outline" className="text-xs font-mono bg-background">
                          {`{{param:${param.name}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Total Recall tokens: {recallTokensUsed.size}</p>
                  <p className="text-xs text-muted-foreground">
                    This template uses dynamic personalization to create a tailored experience
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div 
            className={`
              mx-auto border rounded-lg bg-background overflow-auto h-[60vh]
              ${viewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}
            `}
          >
            <div className="p-6">
              {/* Form Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
                {form.description && (
                  <p className="text-muted-foreground">{form.description}</p>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {fields.map((field: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <FieldRenderer
                      field={{
                        ...field,
                        id: `field-${index}`,
                        form_id: 'preview'
                      }}
                      isPreview={true}
                    />
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <Button 
                  className="w-full" 
                  style={{ 
                    backgroundColor: form.primary_color || '#3b82f6',
                    borderColor: form.primary_color || '#3b82f6'
                  }}
                >
                  Submit Form
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <Eye className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
          <Button onClick={() => onUseTemplate(template)}>
            Use This Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};