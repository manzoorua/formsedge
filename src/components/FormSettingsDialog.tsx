import React, { useState } from 'react';
import { Form } from '@/types/form';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { validateWebhookUrl } from '@/lib/webhookValidation';

interface FormSettingsDialogProps {
  form: Form;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormUpdate: (updatedForm: Form) => void;
}

export const FormSettingsDialog: React.FC<FormSettingsDialogProps> = ({
  form,
  open,
  onOpenChange,
  onFormUpdate,
}) => {
  const [localForm, setLocalForm] = useState(form);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate webhook URL if provided
      if (localForm.webhook_url && localForm.webhook_url.trim() !== '') {
        const validation = validateWebhookUrl(localForm.webhook_url);
        if (!validation.isValid) {
          toast({
            title: "Invalid Webhook URL",
            description: validation.error,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('forms')
        .update({
          title: localForm.title,
          description: localForm.description,
          status: localForm.status,
          is_public: localForm.is_public,
          accept_responses: localForm.accept_responses,
          
          enable_analytics: localForm.enable_analytics,
          branding_enabled: localForm.branding_enabled,
          webhook_url: localForm.webhook_url,
          collect_emails: localForm.collect_emails,
          limit_responses: localForm.limit_responses,
          max_responses: localForm.max_responses,
        })
        .eq('id', form.id)
        .select()
        .single();

      if (error) throw error;

      onFormUpdate({
        ...data,
        url_params_config: (data.url_params_config as unknown as any) || undefined,
        layout: (data.layout as any) || { columns: 1, grid_gap: 'md', responsive: true },
        background: (data.background as any) || undefined
      } as Form);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Form settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update form settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Form Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">Form Title</Label>
                <Input
                  id="title"
                  value={localForm.title}
                  onChange={(e) => setLocalForm({ ...localForm, title: e.target.value })}
                  placeholder="Enter form title"
                />
              </div>
              
              {/* Form Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">Form Description</Label>
                <Textarea
                  id="description"
                  value={localForm.description || ''}
                  onChange={(e) => setLocalForm({ ...localForm, description: e.target.value })}
                  placeholder="Enter form description (optional)"
                  rows={3}
                />
              </div>
              
              <Separator />
              
              {/* Form Status */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Status</Label>
                <Select
                  value={localForm.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    setLocalForm({ ...localForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Draft</Badge>
                        <span>Not accepting responses</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Published</Badge>
                        <span>Accepting responses</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Archived</Badge>
                        <span>Read-only mode</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Public Access */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Public Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone with the link to access this form
                  </p>
                </div>
                <Switch
                  checked={localForm.is_public}
                  onCheckedChange={(checked) => 
                    setLocalForm({ ...localForm, is_public: checked })
                  }
                />
              </div>
              
              {/* Accept Responses */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Accept Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new form submissions
                  </p>
                </div>
                <Switch
                  checked={localForm.accept_responses}
                  onCheckedChange={(checked) => 
                    setLocalForm({ ...localForm, accept_responses: checked })
                  }
                />
              </div>
              
              <Separator />
              
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">Refill Link</Label>
                  <Badge variant="secondary" className="text-xs">PRO</Badge>
                </div>
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  disabled
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Allow users to return and edit their responses
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">reCaptcha</Label>
                  <p className="text-sm text-muted-foreground">
                    Protect against spam submissions
                  </p>
                </div>
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                  disabled
                />
              </div>
            </div>
          </TabsContent>

              <TabsContent value="advanced" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="text-base font-medium">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={localForm.webhook_url || ''}
                  onChange={(e) => setLocalForm({ ...localForm, webhook_url: e.target.value })}
                  placeholder="https://example.com/webhook"
                />
                <p className="text-sm text-muted-foreground">
                  Receive form submissions via webhook
                </p>
              </div>

              <Separator />

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Track form views and completions
                  </p>
                </div>
                <Switch
                  checked={localForm.enable_analytics}
                  onCheckedChange={(checked) => 
                    setLocalForm({ ...localForm, enable_analytics: checked })
                  }
                />
              </div>

              <Separator />

              {/* Branding */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Show "Powered by"</Label>
                  <p className="text-sm text-muted-foreground">
                    Display branding footer in forms
                  </p>
                </div>
                <Switch
                  checked={localForm.branding_enabled}
                  onCheckedChange={(checked) => 
                    setLocalForm({ ...localForm, branding_enabled: checked })
                  }
                />
              </div>

              {/* Collect Emails */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Collect Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically collect user email addresses
                  </p>
                </div>
                <Switch
                  checked={localForm.collect_emails}
                  onCheckedChange={(checked) => 
                    setLocalForm({ ...localForm, collect_emails: checked })
                  }
                />
              </div>

              {/* Response Limits */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Limit Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    Set a maximum number of responses
                  </p>
                </div>
                <Switch
                  checked={localForm.limit_responses}
                  onCheckedChange={(checked) => 
                    setLocalForm({ ...localForm, limit_responses: checked })
                  }
                />
              </div>

              {localForm.limit_responses && (
                <div className="space-y-2">
                  <Label htmlFor="max-responses" className="text-base font-medium">Maximum Responses</Label>
                  <Input
                    id="max-responses"
                    type="number"
                    value={localForm.max_responses || ''}
                    onChange={(e) => setLocalForm({ ...localForm, max_responses: parseInt(e.target.value) || null })}
                    placeholder="Enter maximum number of responses"
                    min={1}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};