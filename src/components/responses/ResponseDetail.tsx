import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { X, Download, Clock, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormUrlParamConfig } from '@/lib/urlParamValidation';
import { Form } from '@/types/form';

interface FormResponse {
  id: string;
  created_at: string;
  updated_at: string;
  is_partial: boolean;
  submitted_at: string | null;
  respondent_email?: string;
  respondent_id?: string;
  url_params?: Record<string, string>;
  form_response_answers: Array<{
    id: string;
    field_id: string;
    value: string;
    file_urls?: any;
  }>;
}

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: any;
}

interface ResponseDetailProps {
  response: FormResponse;
  formId: string;
  onClose: () => void;
}

export const ResponseDetail = ({ response, formId, onClose }: ResponseDetailProps) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFormFields();
  }, [formId]);

  const fetchFormFields = async () => {
    try {
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('id, title, url_params_config')
        .eq('id', formId)
        .single();

      if (formError) throw formError;
      setForm({
        ...formData,
        url_params_config: (formData.url_params_config as unknown as FormUrlParamConfig[]) || undefined
      } as Form);

      const { data: fieldsData, error } = await supabase
        .from('form_fields')
        .select('id, label, type, required, options')
        .eq('form_id', formId)
        .order('order_index');

      if (error) throw error;
      setFields(fieldsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading form fields",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.label || `Field ${fieldId.substring(0, 8)}`;
  };

  const getFieldType = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    return field?.type || 'text';
  };

  const formatValue = (value: string, fieldId: string) => {
    const fieldType = getFieldType(fieldId);
    
    if (!value) return 'No answer';
    
    try {
      // Handle different field types
      switch (fieldType) {
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'time':
          return value;
        case 'checkbox':
          const checkboxValues = JSON.parse(value);
          return Array.isArray(checkboxValues) ? checkboxValues.join(', ') : value;
        case 'radio':
        case 'select':
          return value;
        case 'file':
          return 'File uploaded';
        default:
          return value;
      }
    } catch {
      return value;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getCompletionTime = () => {
    if (!response.submitted_at) return null;
    
    const start = new Date(response.created_at).getTime();
    const end = new Date(response.submitted_at).getTime();
    const minutes = Math.round((end - start) / (1000 * 60));
    
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Response Details</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Response Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Respondent</div>
                    <div className="text-sm text-muted-foreground">
                      {response.respondent_email || 'Anonymous'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={response.is_partial ? "outline" : "default"}>
                    {response.is_partial ? 'Partial' : 'Complete'}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Started</div>
                    <div className="text-muted-foreground">
                      {formatDate(response.created_at)}
                    </div>
                  </div>
                </div>
                
                {response.submitted_at && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Submitted</div>
                        <div className="text-muted-foreground">
                          {formatDate(response.submitted_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Completion Time</div>
                        <div className="text-muted-foreground">
                          {getCompletionTime()}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Response ID: {response.id}
              </div>
            </CardContent>
          </Card>

          {/* URL Parameters Section */}
          {response.url_params && Object.keys(response.url_params).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">URL Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(response.url_params as Record<string, string>).map(([key, value]) => {
                    const config = form?.url_params_config?.find((p: FormUrlParamConfig) => p.name === key);
                    const shouldShow = config?.include_in_responses !== false;
                    
                    if (!shouldShow) return null;
                    
                    return (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium">{config?.label || key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Answers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Answers</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {response.form_response_answers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No answers provided
                </div>
              ) : (
                <div className="space-y-6">
                  {response.form_response_answers.map((answer, index) => (
                    <div key={answer.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {getFieldLabel(answer.field_id)}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wide">
                            {getFieldType(answer.field_id)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted rounded-lg p-3">
                        <div className="text-sm">
                          {formatValue(answer.value, answer.field_id)}
                        </div>
                        
                        {answer.file_urls && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            File attachments available
                          </div>
                        )}
                      </div>
                      
                      {index < response.form_response_answers.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};