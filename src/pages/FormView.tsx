import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { useRecall } from '@/hooks/useRecall';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { FieldRenderer } from '@/components/form-builder/FieldRenderer';
import { LayoutEngine } from '@/components/form-builder/layout/LayoutEngine';
import { useConditionalLogic } from '@/hooks/useConditionalLogic';
import { useIntegrationTrigger } from '@/hooks/useIntegrationTrigger';
import type { FormField, Form } from '@/types/form';
import { FormUrlParamConfig } from '@/lib/urlParamValidation';

const FormView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Detect embed mode
  const isEmbedMode = searchParams.get('embed') === '1';
  const embedMode = searchParams.get('mode') || 'inline';
  const embedTheme = searchParams.get('theme') || 'light';
  const embedProgress = searchParams.get('progress') || 'top';
  const hideTitle = searchParams.get('hideTitle') === 'true';
  const hideDescription = searchParams.get('hideDescription') === 'true';
  
  const [form, setForm] = useState<Form | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  const { triggerIntegrations } = useIntegrationTrigger();
  
  // postMessage helper for embed mode
  const sendToParent = useCallback((type: string, payload: any) => {
    if (!isEmbedMode || window.parent === window) return;
    
    window.parent.postMessage(
      {
        source: 'formsedge-widget',
        type,
        payload: {
          formId: id,
          ...payload,
        },
      },
      '*'
    );
  }, [isEmbedMode, id]);
  
  // Initialize conditional logic and layout engine (runtime mode for public forms)
  const { getVisibleFields } = useConditionalLogic(fields, responses, false);
  
  // Initialize Recall hook for token resolution
  const { resolveRecall } = useRecall(fields, responses, urlParams);
  
  // Memoize layout engine to prevent unnecessary re-creation
  const layoutEngine = useMemo(() => {
    const layout = form?.layout;
    return new LayoutEngine({
      columns: layout?.columns || 1,
      gridGap: (layout?.grid_gap as 'sm' | 'md' | 'lg') || 'md',
      responsive: layout?.responsive ?? true
    });
  }, [form?.layout]);
  
  // Use the already-memoized visible fields directly from the hook
  const visibleFields = getVisibleFields;
  
  // Debug logging to track field visibility
  useEffect(() => {
    console.log('[FormView] Fields loaded:', fields.length);
    console.log('[FormView] Visible fields:', visibleFields.length);
    console.log('[FormView] Current responses:', Object.keys(responses).length);
  }, [fields.length, visibleFields.length, responses]);


  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);
  
  // Parse URL parameters after form is loaded
  useEffect(() => {
    if (!form?.url_params_config) return;
    
    const resolvedParams: Record<string, string> = {};
    const config = form.url_params_config as FormUrlParamConfig[];
    
    config.forEach((cfg) => {
      let value: string | null = null;
      
      // Apply default value if exists
      if (cfg.default_value) {
        value = cfg.default_value;
      }
      
      // Override with URL parameter if present
      const fromUrl = searchParams.get(cfg.name);
      if (fromUrl !== null) {
        value = fromUrl;
      }
      
      // Store if we have a value
      if (value !== null) {
        resolvedParams[cfg.name] = value;
      }
    });
    
    setUrlParams(resolvedParams);
  }, [form, searchParams]);
  
  // Enhanced diagnostics for embed mode - Send ready event
  useEffect(() => {
    if (isEmbedMode && form) {
      console.log('[FormView:Embed] Mounted', { 
        formId: form.id, 
        visibleFieldsCount: visibleFields.length,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
      sendToParent('ready', {});
    }
  }, [isEmbedMode, form, sendToParent, visibleFields.length]);
  
  // Send resize event when content changes in embed mode
  useEffect(() => {
    if (!isEmbedMode) return;
    
    const sendResize = () => {
      const height = document.documentElement.scrollHeight;
      sendToParent('resize', { height });
    };
    
    // Send initial resize
    sendResize();
    
    // Observe for changes
    const observer = new ResizeObserver(sendResize);
    observer.observe(document.body);
    
    return () => observer.disconnect();
  }, [isEmbedMode, sendToParent, isSubmitted, fields]);

  // Debug interaction guard (opt-in via debugInteraction=1)
  useEffect(() => {
    if (isEmbedMode && searchParams.get('debugInteraction') === '1') {
      const style = document.createElement('style');
      style.textContent = 'body, #root { pointer-events: auto !important; }';
      document.head.appendChild(style);
      console.log('[FormView:Embed] Debug interaction guard enabled');
      return () => style.remove();
    }
  }, [isEmbedMode, searchParams]);

  const loadForm = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load form details
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .eq('is_public', true)
        .eq('status', 'published')
        .eq('accept_responses', true)
        .single();

      if (formError) throw formError;
      
      // Load form fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', id)
        .order('order_index');

      if (fieldsError) throw fieldsError;

      // Convert database format to Form type with proper type handling
      const convertedForm = {
        ...formData,
        url_params_config: (formData.url_params_config as unknown as FormUrlParamConfig[]) || undefined,
        layout: typeof formData.layout === 'object' && formData.layout ? formData.layout as any : {
          columns: 4,
          grid_gap: 'md',
          responsive: true
        },
        background: (formData.background as any) || undefined
      } as Form;

      setForm(convertedForm);
      setFields(fieldsData.map((field: any) => ({
        id: field.id,
        type: field.type,
        label: field.label,
        ref: field.ref,
        placeholder: field.placeholder,
        description: field.description,
        required: field.required,
        options: field.options,
        validation_rules: field.validation_rules,
        logic_conditions: field.logic_conditions,
        order_index: field.order_index,
        width: field.width,
        styling: field.styling,
        calculations: field.calculations,
        conditional_logic: field.conditional_logic,
      })));
      
      console.log('[FormView] Loaded fields from DB:', fieldsData.length);
    } catch (error: any) {
      toast({
        title: "Form not found",
        description: "This form is not available or doesn't exist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    if (isEmbedMode) {
      console.log('[FormView:Embed] handleInputChange', { 
        fieldId, 
        value: typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    visibleFields.forEach(field => {
      if (field.required && (!responses[field.id] || responses[field.id] === '')) {
        errors.push(`${field.label} is required`);
      }
    });

    return errors;
  };

  const submitForm = async () => {
    if (isEmbedMode) {
      console.log('[FormView:Embed] submitForm called', {
        responseKeys: Object.keys(responses),
        responsesPreview: JSON.stringify(responses).substring(0, 200) + '...',
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Please fix the following errors:",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create form response
      const { data: responseData, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: id!,
          respondent_id: user?.id || null,
          respondent_email: form?.collect_emails ? responses.email : null,
          is_partial: false,
          submitted_at: new Date().toISOString(),
          url_params: Object.keys(urlParams).length > 0 ? urlParams : null,
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Create answers for each field
      const answers = visibleFields
        .filter(field => responses[field.id] !== undefined && responses[field.id] !== '')
        .map(field => ({
          response_id: responseData.id,
          field_id: field.id,
          value: typeof responses[field.id] === 'string' 
            ? responses[field.id] 
            : JSON.stringify(responses[field.id]),
        }));

      if (answers.length > 0) {
        const { error: answersError } = await supabase
          .from('form_response_answers')
          .insert(answers);

        if (answersError) throw answersError;
      }

      // Trigger integrations
      await triggerIntegrations({
        formId: id!,
        responseId: responseData.id,
        submissionData: responses,
        respondentEmail: form?.collect_emails ? responses.email : undefined,
        urlParams: Object.keys(urlParams).length > 0 ? urlParams : undefined,
      });

      // Send submit event in embed mode
      if (isEmbedMode) {
        sendToParent('submit', {
          responseId: responseData.id,
        });
      }

      // Handle redirect with Recall
      if (form.redirect_url) {
        const resolvedUrl = resolveRecall(form.redirect_url);
        if (resolvedUrl && (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://'))) {
          setTimeout(() => {
            window.location.href = resolvedUrl;
          }, 2000);
        }
      }

      setIsSubmitted(true);
      toast({
        title: "Form submitted successfully!",
        description: "Thank you for your response.",
      });
    } catch (error: any) {
      toast({
        title: "Error submitting form",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) {
    return <Navigate to="/404" replace />;
  }

  if (isSubmitted) {
    const successContent = (
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <CardTitle className="mb-2">Thank You!</CardTitle>
          <CardDescription>
            {resolveRecall(form.thank_you_message) || 'Your form has been submitted successfully. We appreciate your response.'}
          </CardDescription>
        </CardContent>
      </Card>
    );
    
    if (isEmbedMode) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
          background: embedTheme === 'dark' ? '#1a1a1a' : '#ffffff',
        }}>
          {successContent}
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        {successContent}
      </div>
    );
  }

  const fieldPositions = layoutEngine.calculateFieldPositions(visibleFields);
  
  // Build background styles helper
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

  // Render embed mode with design settings
  if (isEmbedMode) {
    const hasCustomBackground = form.background?.type;
    const fallbackBg = embedTheme === 'dark' ? '#1a1a1a' : '#ffffff';
    
    return (
      <div 
        className="min-h-screen relative"
        style={{
          fontFamily: form.font_family || 'inherit',
          color: embedTheme === 'dark' ? '#ffffff' : '#000000',
          padding: '2rem',
          ...(hasCustomBackground ? getBackgroundStyles() : { background: fallbackBg }),
        }}
      >
        {/* Image overlay for readability */}
        {form.background?.type === 'image' && form.background.opacity !== undefined && form.background.opacity > 0 && (
          <div 
            className="absolute inset-0 bg-background pointer-events-none"
            style={{ opacity: form.background.opacity / 100 }}
          />
        )}
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Logo */}
          {form.logo_url && (
            <img 
              src={form.logo_url} 
              alt="Form logo" 
              className="h-12 mb-4 object-contain"
            />
          )}
          
          {/* Form Header */}
          {!hideTitle && (
            <h1 className="text-3xl font-bold mb-4" style={{ color: form.primary_color || '#3b82f6' }}>
              {resolveRecall(form.title)}
            </h1>
          )}
          {!hideDescription && form.description && (
            <p className="text-lg mb-8 opacity-80">
              {resolveRecall(form.description)}
            </p>
          )}

          {/* Progress bar */}
          {embedProgress !== 'none' && (
            <div className="mb-6">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: '100%',
                    backgroundColor: form.primary_color || '#3b82f6' 
                  }}
                />
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className={`${layoutEngine.getContainerClasses()} gap-6 mb-8`}>
            {fieldPositions.map((position) => {
              const field = visibleFields.find(f => f.id === position.id);
              if (!field) return null;

              return (
                <div
                  key={field.id}
                  className={layoutEngine.generateGridClasses(position)}
                >
                  <FieldRenderer
                    field={{
                      ...field,
                      label: resolveRecall(field.label),
                      description: resolveRecall(field.description),
                      placeholder: resolveRecall(field.placeholder),
                    }}
                    fields={visibleFields}
                    formData={responses}
                    value={responses[field.id] || ''}
                    onChange={(value) => handleInputChange(field.id, value)}
                    isPreview={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Email Collection */}
          {form.collect_emails && !user && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={responses.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <Button
              onClick={submitForm}
              disabled={isSubmitting}
              className="px-8 py-4 text-lg"
              size="lg"
              style={{ backgroundColor: form.primary_color || '#3b82f6' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Form
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Normal (non-embed) rendering with design settings
  return (
    <div 
      className="min-h-screen py-8 relative"
      style={{
        fontFamily: form.font_family || 'inherit',
        ...getBackgroundStyles(),
      }}
    >
      {/* Fallback gradient if no custom background */}
      {!form.background?.type && (
        <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      )}
      
      {/* Image overlay for readability */}
      {form.background?.type === 'image' && form.background.opacity !== undefined && form.background.opacity > 0 && (
        <div 
          className="absolute inset-0 bg-background pointer-events-none"
          style={{ opacity: form.background.opacity / 100 }}
        />
      )}
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        {/* Form Header */}
        <div className="mb-8 text-center">
          {/* Logo */}
          {form.logo_url && (
            <img 
              src={form.logo_url} 
              alt="Form logo" 
              className="h-16 mb-6 object-contain mx-auto"
            />
          )}
          
          <div className="flex items-center justify-center mb-4">
            <Badge variant="outline">Public Form</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: form.primary_color || '#3b82f6' }}>
            {resolveRecall(form.title)}
          </h1>
          {form.description && (
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              {resolveRecall(form.description)}
            </p>
          )}
        </div>

        {/* Form Fields */}
        <div className={`${layoutEngine.getContainerClasses()} gap-6 mb-8`}>
          {fieldPositions.map((position) => {
            const field = visibleFields.find(f => f.id === position.id);
            if (!field) return null;

            return (
              <div
                key={field.id}
                className={layoutEngine.generateGridClasses(position)}
              >
                <FieldRenderer
                  field={{
                    ...field,
                    label: resolveRecall(field.label),
                    description: resolveRecall(field.description),
                    placeholder: resolveRecall(field.placeholder),
                  }}
                  fields={visibleFields}
                  formData={responses}
                  value={responses[field.id] || ''}
                  onChange={(value) => handleInputChange(field.id, value)}
                  isPreview={false}
                />
              </div>
            );
          })}
        </div>

        {/* Email Collection */}
        {form.collect_emails && !user && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={responses.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <Button
            onClick={submitForm}
            disabled={isSubmitting}
            className="px-8 py-4 text-lg shadow-primary"
            size="lg"
            style={{ backgroundColor: form.primary_color || '#3b82f6' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Submit Form
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-primary">FormsEdge</span>
        </div>
      </div>
    </div>
  );
};

export default FormView;