import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Zap, Webhook, Mail, FileSpreadsheet, MessageSquare, Settings, CheckCircle, XCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateWebhookUrl } from '@/lib/webhookValidation';
import { WebhookLogsDialog } from '@/components/integrations/WebhookLogsDialog';

interface Integration {
  id: string;
  form_id: string;
  integration_type: string;
  name: string;
  configuration: any;
  is_active: boolean;
  status: string;
  last_triggered_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Form {
  id: string;
  title: string;
  owner_id: string;
}

const AVAILABLE_INTEGRATIONS = [
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Send form data to any HTTP endpoint',
    icon: Webhook,
    color: 'bg-blue-500'
  },
  {
    type: 'n8n',
    name: 'n8n',
    description: 'Connect to n8n workflows for advanced automation',
    icon: Zap,
    color: 'bg-purple-500'
  },
  {
    type: 'email',
    name: 'Email Notifications',
    description: 'Send email notifications on form submissions',
    icon: Mail,
    color: 'bg-green-500'
  },
  {
    type: 'zapier',
    name: 'Zapier',
    description: 'Connect to 3000+ apps via Zapier webhooks',
    icon: Zap,
    color: 'bg-orange-500'
  },
  {
    type: 'sheets',
    name: 'Google Sheets',
    description: 'Save responses directly to Google Sheets',
    icon: FileSpreadsheet,
    color: 'bg-emerald-500'
  },
  {
    type: 'slack',
    name: 'Slack',
    description: 'Get notified in Slack channels',
    icon: MessageSquare,
    color: 'bg-violet-500'
  }
];

const FormIntegrations = () => {
  const { id: formId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [integrationConfig, setIntegrationConfig] = useState({
    name: '',
    webhookUrl: '',
    secret: '',
    isActive: true
  });

  useEffect(() => {
    if (formId && user) {
      loadFormAndIntegrations();
    }
  }, [formId, user]);

  const loadFormAndIntegrations = async () => {
    try {
      const [formResponse, integrationsResponse] = await Promise.all([
        supabase.from('forms').select('id, title, owner_id').eq('id', formId).single(),
        supabase.from('form_integrations').select('*').eq('form_id', formId)
      ]);

      if (formResponse.error) throw formResponse.error;
      if (integrationsResponse.error) throw integrationsResponse.error;

      setForm(formResponse.data);
      setIntegrations(integrationsResponse.data);
    } catch (error) {
      console.error('Error loading form and integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load form integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'testing':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'default',
      disconnected: 'secondary',
      error: 'destructive',
      testing: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleConfigureIntegration = (integrationType: string) => {
    const availableIntegration = AVAILABLE_INTEGRATIONS.find(i => i.type === integrationType);
    setSelectedIntegration(availableIntegration);
    setEditingIntegration(null);
    setIntegrationConfig({
      name: `My ${availableIntegration?.name} Integration`,
      webhookUrl: '',
      secret: '',
      isActive: true
    });
    setTestResult(null);
    setDialogOpen(true);
  };

  const handleEditIntegration = (integration: Integration) => {
    const availableIntegration = AVAILABLE_INTEGRATIONS.find(i => i.type === integration.integration_type);
    setSelectedIntegration(availableIntegration);
    setEditingIntegration(integration);
    setIntegrationConfig({
      name: integration.name,
      webhookUrl: integration.configuration?.webhook_url || integration.configuration?.url || '',
      secret: integration.configuration?.secret || '',
      isActive: integration.is_active
    });
    setTestResult(null);
    setDialogOpen(true);
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);
    
    try {
      if (!integrationConfig.webhookUrl.trim()) {
        throw new Error('Please enter a webhook URL');
      }
      
      const { isValid, error } = validateWebhookUrl(integrationConfig.webhookUrl);
      if (!isValid) {
        throw new Error(error);
      }
      
      const samplePayload = {
        event_id: crypto.randomUUID(),
        event_type: 'form_response',
        created_at: new Date().toISOString(),
        form_response: {
          id: 'sample-response-id',
          form_id: formId,
          form_title: form?.title || 'Test Form',
          status: 'complete',
          respondent_id: null,
          respondent_email: 'test@example.com',
          created_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
          url_params: { utm_source: 'test' },
          metadata: {
            completion_time_seconds: 120,
            completion_time_label: '2 minutes'
          },
          answers: [
            {
              field: {
                id: 'sample-field-id',
                label: 'Sample Question',
                type: 'text'
              },
              type: 'text',
              value: 'Sample answer for testing'
            }
          ]
        }
      };
      
      const response = await fetch(integrationConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FormsEdge-Webhook-Test/1.0'
        },
        body: JSON.stringify(samplePayload)
      });
      
      const responseText = await response.text();
      
      setTestResult({
        success: response.ok,
        message: response.ok 
          ? `Success! Webhook endpoint returned HTTP ${response.status}`
          : `Failed with HTTP ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        }
      });
      
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Test failed',
        details: error
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleSaveIntegration = async () => {
    if (!formId || !user || !selectedIntegration) return;
    
    setSaving(true);
    
    try {
      if (!integrationConfig.name.trim()) {
        throw new Error('Integration name is required');
      }
      
      if (selectedIntegration.type === 'webhook' || selectedIntegration.type === 'n8n' || selectedIntegration.type === 'zapier') {
        if (!integrationConfig.webhookUrl.trim()) {
          throw new Error('Webhook URL is required');
        }
        
        const { isValid, error } = validateWebhookUrl(integrationConfig.webhookUrl);
        if (!isValid) {
          throw new Error(error);
        }
      }
      
      const configuration: any = {};
      
      if (selectedIntegration.type === 'webhook') {
        configuration.webhook_url = integrationConfig.webhookUrl;
        configuration.url = integrationConfig.webhookUrl;
        if (integrationConfig.secret) {
          configuration.secret = integrationConfig.secret;
        }
      } else if (selectedIntegration.type === 'n8n' || selectedIntegration.type === 'zapier') {
        configuration.webhook_url = integrationConfig.webhookUrl;
        configuration.url = integrationConfig.webhookUrl;
      }
      
      if (editingIntegration) {
        const { error } = await supabase
          .from('form_integrations')
          .update({
            name: integrationConfig.name,
            configuration,
            is_active: integrationConfig.isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingIntegration.id);
        
        if (error) throw error;
        
        toast({
          title: "Integration updated",
          description: `${integrationConfig.name} has been updated successfully`,
        });
      } else {
        const { error } = await supabase
          .from('form_integrations')
          .insert({
            form_id: formId,
            integration_type: selectedIntegration.type,
            name: integrationConfig.name,
            configuration,
            is_active: integrationConfig.isActive,
            status: 'connected',
            created_by: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Integration connected",
          description: `${integrationConfig.name} has been connected successfully`,
        });
      }
      
      await loadFormAndIntegrations();
      setDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error saving integration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save integration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: string, integrationName: string) => {
    if (!confirm(`Are you sure you want to delete "${integrationName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('form_integrations')
        .delete()
        .eq('id', integrationId);
      
      if (error) throw error;
      
      toast({
        title: "Integration deleted",
        description: `${integrationName} has been removed`,
      });
      
      await loadFormAndIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete integration",
        variant: "destructive",
      });
    }
  };

  const isIntegrationConnected = (type: string) => {
    return integrations.some(integration => 
      integration.integration_type === type && integration.is_active
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Form not found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{form.title}</h1>
            <p className="text-muted-foreground mt-1">Manage integrations for this form</p>
          </div>
        </div>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Connected Integrations</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => {
              const config = AVAILABLE_INTEGRATIONS.find(i => i.type === integration.integration_type);
              const Icon = config?.icon || Settings;
              
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-md ${config?.color || 'bg-muted'}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{integration.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {config?.description || integration.integration_type}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-2">
                      {getStatusBadge(integration.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      {(integration.integration_type === 'webhook' || 
                        integration.integration_type === 'n8n' || 
                        integration.integration_type === 'zapier') && (
                        <WebhookLogsDialog 
                          integrationId={integration.id}
                          integrationName={integration.name}
                        />
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditIntegration(integration)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteIntegration(integration.id, integration.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {integration.last_error && (
                      <p className="text-xs text-destructive mt-2">{integration.last_error}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AVAILABLE_INTEGRATIONS.map((integration) => {
            const Icon = integration.icon;
            const isConnected = isIntegrationConnected(integration.type);
            
            return (
              <Card key={integration.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md ${integration.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleConfigureIntegration(integration.type)}
                    variant={isConnected ? "outline" : "default"}
                    className="w-full"
                  >
                    {isConnected ? (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Add Another
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingIntegration ? 'Edit' : 'Configure'} {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                value={integrationConfig.name}
                onChange={(e) => setIntegrationConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`My ${selectedIntegration?.name} Integration`}
              />
            </div>
            {(selectedIntegration?.type === 'webhook' || selectedIntegration?.type === 'n8n' || selectedIntegration?.type === 'zapier') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">
                    {selectedIntegration.type === 'n8n' ? 'n8n Webhook URL' : 'Webhook URL'}
                  </Label>
                  <Input
                    id="webhook-url"
                    value={integrationConfig.webhookUrl}
                    onChange={(e) => setIntegrationConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://your-endpoint.com/webhook"
                    type="url"
                  />
                  {selectedIntegration.type === 'n8n' && (
                    <p className="text-sm text-muted-foreground">
                      Create a webhook trigger in your n8n workflow and paste the URL here.
                    </p>
                  )}
                </div>
                
                {selectedIntegration?.type === 'webhook' && (
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                    <Input
                      id="webhook-secret"
                      value={integrationConfig.secret}
                      onChange={(e) => setIntegrationConfig(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="Leave empty for no signature verification"
                      type="password"
                    />
                    <p className="text-sm text-muted-foreground">
                      Used to generate HMAC signature in X-FormsEdge-Signature header
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {testingWebhook ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test Webhook
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className={`p-3 rounded-md ${testResult.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span className="font-medium">{testResult.message}</span>
                    </div>
                    {testResult.details && (
                      <details className="text-xs mt-2">
                        <summary className="cursor-pointer">View details</summary>
                        <pre className="mt-2 p-2 bg-background/50 rounded overflow-auto">
                          {JSON.stringify(testResult.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </>
            )}
            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                checked={integrationConfig.isActive}
                onCheckedChange={(checked) => setIntegrationConfig(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="active">Enable this integration</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveIntegration}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Integration'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormIntegrations;
