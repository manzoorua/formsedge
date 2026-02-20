import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { Form, FormField } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';
import { LayoutEngine } from './layout/LayoutEngine';
import { X, Monitor, Tablet, Smartphone, CheckCircle } from 'lucide-react';
import { useConditionalLogic } from '../../hooks/useConditionalLogic';
import { useRecall } from '../../hooks/useRecall';
import { cn } from '../../lib/utils';

interface FormPreviewProps {
  open: boolean;
  onClose: () => void;
  form: Form;
  fields: FormField[];
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export const FormPreview: React.FC<FormPreviewProps> = ({
  open,
  onClose,
  form,
  fields,
}) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { getVisibleFields } = useConditionalLogic(fields, formData);
  const visibleFields = getVisibleFields;
  
  // Initialize Recall with sample data for preview
  const mockUrlParams = useMemo(() => {
    const params: Record<string, string> = {};
    (form.url_params_config || []).forEach(cfg => {
      params[cfg.name] = `[${cfg.name}]`;
    });
    return params;
  }, [form.url_params_config]);
  
  const { resolveRecall } = useRecall(fields, formData, mockUrlParams);

  // Layout engine for grid positioning (same as canvas)
  const layoutEngine = useMemo(() => {
    const layoutConfig = {
      columns: Math.max(4, form.layout?.columns || 4),
      gridGap: (form.layout?.grid_gap as 'sm' | 'md' | 'lg') || 'md',
      responsive: form.layout?.responsive ?? true,
    };
    
    return new LayoutEngine(layoutConfig);
  }, [form.layout]);

  const fieldPositions = useMemo(() => 
    layoutEngine.calculateFieldPositions(visibleFields),
    [layoutEngine, visibleFields]
  );

  const containerClasses = useMemo(() => 
    layoutEngine.getContainerClasses(),
    [layoutEngine]
  );

  const deviceSizes = {
    desktop: 'max-w-4xl',
    tablet: 'max-w-2xl',
    mobile: 'max-w-sm',
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    visibleFields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.label} is required`;
      }
      
      // Additional validation based on field type
      if (formData[field.id]) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData[field.id])) {
              newErrors[field.id] = 'Please enter a valid email address';
            }
            break;
          case 'phone':
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(formData[field.id])) {
              newErrors[field.id] = 'Please enter a valid phone number';
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitted(true);
    }
  };


  const resetPreview = () => {
    setFormData({});
    setErrors({});
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Form Preview - {form.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {/* Device Selection */}
              <div className="flex items-center rounded-lg border p-1">
                <Button
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('desktop')}
                  className="h-8"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('tablet')}
                  className="h-8"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('mobile')}
                  className="h-8"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetPreview}
                disabled={Object.keys(formData).length === 0 && !submitted}
              >
                Reset
              </Button>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <div className={cn("mx-auto transition-all duration-300", deviceSizes[device])}>
          <div 
            className="bg-background rounded-lg border shadow-lg overflow-hidden relative"
            style={{
              fontFamily: form.font_family || 'inherit',
              ...(form.background?.type === 'color' && { backgroundColor: form.background.value }),
              ...(form.background?.type === 'gradient' && { background: form.background.value }),
              ...(form.background?.type === 'image' && {
                backgroundImage: `url(${form.background.value})`,
                backgroundSize: form.background.size || 'cover',
                backgroundPosition: form.background.position || 'center',
                backgroundRepeat: 'no-repeat'
              })
            }}
          >
            {/* Image overlay for readability */}
            {form.background?.type === 'image' && form.background.opacity !== undefined && form.background.opacity > 0 && (
              <div 
                className="absolute inset-0 bg-background pointer-events-none"
                style={{ opacity: form.background.opacity / 100 }}
              />
            )}
            
            {/* Form Header */}
            <div 
              className="p-6 border-b relative z-10"
              style={{
                background: form.background ? 'transparent' : 'linear-gradient(to right, hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.05))'
              }}
            >
              {/* Logo */}
              {form.logo_url && (
                <img 
                  src={form.logo_url} 
                  alt="Form logo" 
                  className="h-12 mb-4 object-contain"
                />
              )}
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: form.primary_color || 'hsl(var(--foreground))' }}
              >
                {resolveRecall(form.title)}
              </h1>
              {form.description && (
                <p className="text-muted-foreground">
                  {resolveRecall(form.description)}
                </p>
              )}
            </div>

              {/* Form Content */}
              <div className="p-6 relative z-10">
                {submitted ? (
                  // Thank You Message
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Form Submitted!
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {resolveRecall(form.thank_you_message) || 'Thank you for your submission!'}
                    </p>
                  </div>
                ) : (
                  // Form Fields
                  <form onSubmit={handleSubmit}>
                    {visibleFields.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No fields have been added to this form yet.</p>
                        <p className="text-sm mt-1">Add fields using the field palette to see them here.</p>
                      </div>
                    ) : (
                      <>
                        {/* Grid Layout - Same as Canvas */}
                        <div className={`w-full ${containerClasses}`}>
                          {visibleFields.map((field) => {
                            const position = fieldPositions.find(p => p.id === field.id);
                            const gridClasses = position ? layoutEngine.generateGridClasses(position) : '';
                            
                            return (
                              <div key={field.id} className={`${gridClasses} space-y-2`}>
                                <FieldRenderer
                                  field={{
                                    ...field,
                                    label: resolveRecall(field.label),
                                    description: resolveRecall(field.description),
                                    placeholder: resolveRecall(field.placeholder),
                                  }}
                                  fields={visibleFields}
                                  formData={formData}
                                  value={formData[field.id]}
                                  onChange={(value) => handleFieldChange(field.id, value)}
                                  isPreview={false}
                                />
                                {errors[field.id] && (
                                  <p className="text-sm text-destructive flex items-center gap-1">
                                    {errors[field.id]}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t col-span-full">
                          <Button 
                            type="submit" 
                            className="w-full"
                            style={{
                              backgroundColor: form.primary_color,
                              color: '#ffffff'
                            }}
                          >
                            Submit Form
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 border-t bg-muted/50 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {form.status === 'published' ? 'Live Preview' : 'Draft Preview'}
                  </Badge>
                  <span>•</span>
                  <span>{visibleFields.length} field{visibleFields.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};