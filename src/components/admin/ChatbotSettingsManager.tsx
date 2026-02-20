import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Settings } from 'lucide-react';
import { useChatbotSettings } from '@/hooks/useChatbotSettings';
import { useToast } from '@/hooks/use-toast';

const ChatbotSettingsManager: React.FC = () => {
  const { config, loading, updateSettings } = useChatbotSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [localConfig, setLocalConfig] = useState({
    enabled: config?.enabled || false,
    widgetId: config?.widgetId || 'widget_7243353be9689ba901ea6816',
    initialState: (config?.initialState || 'closed') as 'closed' | 'minimized' | 'open',
    mode: (config?.mode || 'app') as 'app' | 'iframe',
  });

  React.useEffect(() => {
    if (config) {
      setLocalConfig({
        enabled: config.enabled,
        widgetId: config.widgetId,
        initialState: config.initialState as 'closed' | 'minimized' | 'open',
        mode: (config.mode || 'app') as 'app' | 'iframe',
      });
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updateSettings(localConfig);
      if (success) {
        toast({
          title: "Settings Updated",
          description: "Chatbot settings have been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chatbot settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    const newConfig = { ...localConfig, enabled };
    setLocalConfig(newConfig);
    
    setSaving(true);
    try {
      const success = await updateSettings({ enabled });
      if (success) {
        toast({
          title: enabled ? "Chatbot Enabled" : "Chatbot Disabled",
          description: `Chatbot has been ${enabled ? 'enabled' : 'disabled'} globally.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chatbot status.",
        variant: "destructive",
      });
      // Revert on error
      setLocalConfig({ ...localConfig, enabled: !enabled });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Chatbot Settings</CardTitle>
          </div>
          <CardDescription>
            Configure the RagCanvas chatbot widget for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Chatbot</Label>
              <p className="text-sm text-muted-foreground">
                Toggle the chatbot widget globally across the application
              </p>
            </div>
            <Switch
              checked={localConfig.enabled}
              onCheckedChange={handleToggleEnabled}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {localConfig.enabled && (
        <>
          {/* Widget Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Widget Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure your RAGcanvas widget ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widgetId">Widget ID</Label>
                <Input
                  id="widgetId"
                  value={localConfig.widgetId}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    widgetId: e.target.value
                  })}
                  placeholder="widget_7243353be9689ba901ea6816"
                />
                <p className="text-sm text-muted-foreground">
                  Your RAGcanvas widget identifier from your dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedMode">Embed Mode</Label>
                <Select 
                  value={localConfig.mode} 
                  onValueChange={(value: 'app' | 'iframe') => setLocalConfig({
                    ...localConfig,
                    mode: value
                  })}
                >
                  <SelectTrigger id="embedMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">Full viewport overlay (recommended for floating bubble)</SelectItem>
                    <SelectItem value="iframe">Fixed-size window (shows as boxed chat widget)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  App mode: Floating bubble, page stays clickable. Iframe mode: Fixed 400x600px chat box.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialState">Initial State</Label>
                <Select 
                  value={localConfig.initialState} 
                  onValueChange={(value: 'closed' | 'minimized' | 'open') => setLocalConfig({
                    ...localConfig,
                    initialState: value
                  })}
                >
                  <SelectTrigger id="initialState">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="minimized">Minimized</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How the widget appears when the page loads (applies to full viewport mode)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ChatbotSettingsManager;