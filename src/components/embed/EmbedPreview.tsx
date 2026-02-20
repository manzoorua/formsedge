import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle } from 'lucide-react';
import { Form, FormField } from '../../types/form';
import { FieldRenderer } from '../form-builder/FieldRenderer';
import { LayoutEngine } from '../form-builder/layout/LayoutEngine';
import { useConditionalLogic } from '../../hooks/useConditionalLogic';
import { cn } from '../../lib/utils';

interface EmbedConfig {
  type: 'iframe' | 'popup' | 'slider' | 'widget';
  width: string;
  height: string;
  position: string;
  trigger: string;
  theme: string;
  hideTitle?: boolean;
  hideDescription?: boolean;
}

interface EmbedPreviewProps {
  formId: string;
  config: EmbedConfig;
  device: 'desktop' | 'tablet' | 'mobile';
  disabled: boolean;
}

export const EmbedPreview = ({ formId, config, device, disabled }: EmbedPreviewProps) => {
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const { getVisibleFields } = useConditionalLogic(fields, formData);
  const visibleFields = getVisibleFields;

  // Layout engine for grid positioning (same as FormPreview)
  const layoutEngine = useMemo(() => {
    if (!form) return null;
    
    const layoutConfig = {
      columns: Math.max(4, form.layout?.columns || 4),
      gridGap: (form.layout?.grid_gap as 'sm' | 'md' | 'lg') || 'md',
      responsive: form.layout?.responsive ?? true,
    };
    
    return new LayoutEngine(layoutConfig);
  }, [form?.layout]);

  const fieldPositions = useMemo(() => 
    layoutEngine ? layoutEngine.calculateFieldPositions(visibleFields) : [],
    [layoutEngine, visibleFields]
  );

  const containerClasses = useMemo(() => 
    layoutEngine ? layoutEngine.getContainerClasses() : '',
    [layoutEngine]
  );

  useEffect(() => {
    if (!disabled && formId) {
      loadFormData();
    }
  }, [formId, disabled]);

  const loadFormData = async () => {
    setLoading(true);
    try {
      // Load form details
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;
      
      // Load form fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('order_index');

      if (fieldsError) throw fieldsError;

      // Convert database format to FormField type
      const convertedForm: Form = {
        ...formData,
        url_params_config: (formData.url_params_config as unknown as any) || undefined,
        layout: typeof formData.layout === 'object' && formData.layout ? formData.layout as any : {
          columns: 4,
          grid_gap: 'md',
          responsive: true
        },
        background: (formData.background as any) || undefined
      };

      setForm(convertedForm);
      setFields(fieldsData.map((field: any) => ({
        ...field,
        options: field.options ? (Array.isArray(field.options) ? field.options : JSON.parse(field.options)) : undefined,
      })));
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
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


  if (disabled) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <div className="mb-2">Preview not available</div>
          <div className="text-sm">Form must be published to preview embed</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden" style={{ width: getDeviceWidth(), margin: '0 auto' }}>
        <div className="h-96 bg-gradient-subtle flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="border rounded-lg overflow-hidden" style={{ width: getDeviceWidth(), margin: '0 auto' }}>
        <div className="h-96 bg-gradient-subtle flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mb-2">Form not found</div>
            <div className="text-sm">Unable to load form data</div>
          </div>
        </div>
      </div>
    );
  }

  // Build background styles
  const getBackgroundStyles = () => {
    if (!form.background) return {};
    
    switch (form.background.type) {
      case 'color':
        return { backgroundColor: form.background.value };
      case 'gradient':
        return { background: form.background.value };
      case 'image':
        return {
          backgroundImage: `url(${form.background.value})`,
          backgroundSize: form.background.size || 'cover',
          backgroundPosition: form.background.position || 'center',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return {};
    }
  };

  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-lg relative" 
      style={{ 
        width: getDeviceWidth(), 
        margin: '0 auto', 
        maxHeight: '600px', 
        overflowY: 'auto',
        fontFamily: form.font_family || 'inherit',
        ...getBackgroundStyles(),
      }}
    >
      {/* Fallback background if no custom background */}
      {!form.background?.type && (
        <div className="absolute inset-0 bg-background -z-10" />
      )}
      
      {/* Image overlay for readability */}
      {form.background?.type === 'image' && form.background.opacity !== undefined && form.background.opacity > 0 && (
        <div 
          className="absolute inset-0 bg-background pointer-events-none"
          style={{ opacity: form.background.opacity / 100 }}
        />
      )}
      
      {/* Form Header */}
      {!config.hideTitle && (
        <div 
          className="p-6 border-b relative z-10"
          style={{
            background: form.background ? 'transparent' : 'linear-gradient(to right, hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.05))'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">Live Preview</Badge>
          </div>
          
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
            {form.title}
          </h1>
          
          {!config.hideDescription && form.description && (
            <p className="text-muted-foreground">
              {form.description}
            </p>
          )}
        </div>
      )}

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
              {form.thank_you_message || 'Thank you for your submission!'}
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
                {/* Grid Layout - Same as FormPreview */}
                <div className={`w-full ${containerClasses}`}>
                  {visibleFields.map((field) => {
                    const position = fieldPositions.find(p => p.id === field.id);
                    const gridClasses = position && layoutEngine ? layoutEngine.generateGridClasses(position) : '';
                    
                    return (
                      <div key={field.id} className={`${gridClasses} space-y-2`}>
                        <FieldRenderer
                          field={field}
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
      <div className="px-6 py-4 border-t bg-muted/50 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            {form.status === 'published' ? 'Live Preview' : 'Draft Preview'}
          </Badge>
          <span>•</span>
          <span>{visibleFields.length} field{visibleFields.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};