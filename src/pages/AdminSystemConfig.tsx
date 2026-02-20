import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Flag, Shield, Mail, BarChart, History, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface SystemConfig {
  id: string;
  config_key: string;
  config_value: any;
  category: string;
  description: string;
  is_sensitive: boolean;
  updated_at: string;
}

interface AuditLog {
  id: string;
  old_value: any;
  new_value: any;
  changed_by_email: string;
  changed_at: string;
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean;
}

const AdminSystemConfig = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedConfigKey, setSelectedConfigKey] = useState<string | null>(null);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const { toast } = useToast();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-system-config', {
        body: { action: 'get_all' },
      });

      if (error) throw error;
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching system config:', error);
      toast({
        title: "Error",
        description: "Failed to load system configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (configKey: string, newValue: any) => {
    try {
      setSaving(true);
      const { error } = await supabase.functions.invoke('admin-system-config', {
        body: {
          action: 'update',
          configKey,
          configValue: newValue,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration updated successfully"
      });

      fetchConfigs();
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchAuditLog = async (configKey: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-system-config', {
        body: { action: 'get_audit_log', configKey },
      });

      if (error) throw error;
      setAuditLogs(data.audit_logs || []);
      setSelectedConfigKey(configKey);
    } catch (error) {
      console.error('Error fetching audit log:', error);
      toast({
        title: "Error",
        description: "Failed to load audit log",
        variant: "destructive"
      });
    }
  };

  const fetchPricingTiers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-system-config', {
        body: { action: 'get_pricing_tiers' },
      });

      if (error) throw error;
      setPricingTiers(data.tiers || []);
    } catch (error) {
      console.error('Error fetching pricing tiers:', error);
    }
  };

  const updatePricingTier = async (tierId: string, tierData: Partial<PricingTier>) => {
    try {
      setSaving(true);
      const { error } = await supabase.functions.invoke('admin-system-config', {
        body: {
          action: 'update_pricing_tier',
          tierId,
          tierData,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing updated successfully"
      });

      fetchPricingTiers();
    } catch (error) {
      console.error('Error updating pricing tier:', error);
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchPricingTiers();
  }, []);

  const getConfigByKey = (key: string) => configs.find(c => c.config_key === key);

  const FeatureFlagsPanel = () => {
    const config = getConfigByKey('feature_flags');
    if (!config) return null;

    const flags = config.config_value;

    const toggleFlag = (flagKey: string) => {
      const newFlags = { ...flags, [flagKey]: !flags[flagKey] };
      updateConfig('feature_flags', newFlags);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Feature Flags
          </CardTitle>
          <CardDescription>Control global feature availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(flags).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-muted-foreground">
                  {value ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Switch
                checked={value as boolean}
                onCheckedChange={() => toggleFlag(key)}
                disabled={saving}
              />
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchAuditLog('feature_flags')}
          >
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
        </CardContent>
      </Card>
    );
  };

  const TierLimitsPanel = () => {
    const tiers = ['free', 'pro', 'enterprise'];
    
    return (
      <div className="space-y-4">
        {tiers.map((tier) => {
          const config = getConfigByKey(`tier_limits_${tier}`);
          if (!config) return null;

          const limits = config.config_value;

          const updateLimit = (limitKey: string, value: string) => {
            const numValue = parseInt(value) || 0;
            const newLimits = { ...limits, [limitKey]: numValue === -1 ? -1 : numValue };
            updateConfig(`tier_limits_${tier}`, newLimits);
          };

          return (
            <Card key={tier}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{tier} Tier</span>
                  <Badge>{tier === 'enterprise' ? 'Unlimited' : tier === 'pro' ? 'Premium' : 'Basic'}</Badge>
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Max Forms</label>
                    <Input
                      type="number"
                      value={limits.max_forms}
                      onChange={(e) => updateLimit('max_forms', e.target.value)}
                      placeholder="Unlimited = -1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Responses</label>
                    <Input
                      type="number"
                      value={limits.max_responses_per_form}
                      onChange={(e) => updateLimit('max_responses_per_form', e.target.value)}
                      placeholder="Unlimited = -1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max File Upload (MB)</label>
                    <Input
                      type="number"
                      value={limits.max_file_upload_mb}
                      onChange={(e) => updateLimit('max_file_upload_mb', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      checked={limits.advanced_features}
                      onCheckedChange={(checked) => {
                        const newLimits = { ...limits, advanced_features: checked };
                        updateConfig(`tier_limits_${tier}`, newLimits);
                      }}
                    />
                    <label className="text-sm font-medium">Advanced Features</label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => updateConfig(`tier_limits_${tier}`, limits)}>
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchAuditLog(`tier_limits_${tier}`)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const SMTPPanel = () => {
    const config = getConfigByKey('smtp_settings');
    if (!config) return null;

    const [smtp, setSMTP] = useState(config.config_value);

    const handleSave = () => {
      updateConfig('smtp_settings', smtp);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>Configure email sending settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Enable SMTP</p>
              <p className="text-sm text-muted-foreground">Use custom SMTP server for emails</p>
            </div>
            <Switch
              checked={smtp.enabled}
              onCheckedChange={(checked) => setSMTP({ ...smtp, enabled: checked })}
            />
          </div>

          {smtp.enabled && (
            <>
              <div>
                <label className="text-sm font-medium">SMTP Host</label>
                <Input
                  value={smtp.host}
                  onChange={(e) => setSMTP({ ...smtp, host: e.target.value })}
                  placeholder="smtp.example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Port</label>
                <Input
                  type="number"
                  value={smtp.port}
                  onChange={(e) => setSMTP({ ...smtp, port: parseInt(e.target.value) })}
                  placeholder="587"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={smtp.username}
                  onChange={(e) => setSMTP({ ...smtp, username: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">From Email</label>
                <Input
                  type="email"
                  value={smtp.from_email}
                  onChange={(e) => setSMTP({ ...smtp, from_email: e.target.value })}
                  placeholder="noreply@formsedge.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">From Name</label>
                <Input
                  value={smtp.from_name}
                  onChange={(e) => setSMTP({ ...smtp, from_name: e.target.value })}
                  placeholder="FormsEdge"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              Save SMTP Settings
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchAuditLog('smtp_settings')}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SecurityPanel = () => {
    const config = getConfigByKey('security_settings');
    if (!config) return null;

    const [security, setSecurity] = useState(config.config_value);

    const handleSave = () => {
      updateConfig('security_settings', security);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Configure authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Max Login Attempts</label>
            <Input
              type="number"
              value={security.max_login_attempts}
              onChange={(e) => setSecurity({ ...security, max_login_attempts: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Session Timeout (minutes)</label>
            <Input
              type="number"
              value={security.session_timeout_minutes}
              onChange={(e) => setSecurity({ ...security, session_timeout_minutes: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Minimum Password Length</label>
            <Input
              type="number"
              value={security.password_min_length}
              onChange={(e) => setSecurity({ ...security, password_min_length: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Require Email Verification</p>
              <p className="text-sm text-muted-foreground">Force users to verify email on signup</p>
            </div>
            <Switch
              checked={security.require_email_verification}
              onCheckedChange={(checked) => setSecurity({ ...security, require_email_verification: checked })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              Save Security Settings
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchAuditLog('security_settings')}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PricingPanel = () => {
    const [localPricing, setLocalPricing] = useState<Record<string, {
      price_monthly: string;
      price_yearly: string;
      stripe_price_id_monthly: string;
      stripe_price_id_yearly: string;
    }>>({});

    useEffect(() => {
      const initial: typeof localPricing = {};
      pricingTiers.forEach(tier => {
        initial[tier.id] = {
          price_monthly: (tier.price_monthly / 100).toString(),
          price_yearly: tier.price_yearly ? (tier.price_yearly / 100).toString() : '',
          stripe_price_id_monthly: tier.stripe_price_id_monthly || '',
          stripe_price_id_yearly: tier.stripe_price_id_yearly || '',
        };
      });
      setLocalPricing(initial);
    }, [pricingTiers]);

    const handleSave = (tierId: string) => {
      const data = localPricing[tierId];
      if (!data) return;

      const priceMonthly = Math.round(parseFloat(data.price_monthly || '0') * 100);
      const priceYearly = data.price_yearly ? Math.round(parseFloat(data.price_yearly) * 100) : null;

      updatePricingTier(tierId, {
        price_monthly: priceMonthly,
        price_yearly: priceYearly,
        stripe_price_id_monthly: data.stripe_price_id_monthly || null,
        stripe_price_id_yearly: data.stripe_price_id_yearly || null,
      });
    };

    const calculateSavings = (monthly: string, yearly: string) => {
      const m = parseFloat(monthly) || 0;
      const y = parseFloat(yearly) || 0;
      if (m === 0 || y === 0) return 0;
      const monthlyTotal = m * 12;
      return Math.round(((monthlyTotal - y) / monthlyTotal) * 100);
    };

    return (
      <div className="space-y-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Subscription Pricing
            </CardTitle>
            <CardDescription>
              Configure pricing for each subscription tier. Prices are stored in cents but displayed in dollars.
            </CardDescription>
          </CardHeader>
        </Card>

        {pricingTiers.map((tier) => {
          const local = localPricing[tier.id];
          if (!local) return null;

          const savings = calculateSavings(local.price_monthly, local.price_yearly);

          return (
            <Card key={tier.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{tier.name} Tier</span>
                  <Badge variant={tier.name === 'pro' ? 'default' : 'outline'}>
                    {tier.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Monthly Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={local.price_monthly}
                      onChange={(e) => setLocalPricing(prev => ({
                        ...prev,
                        [tier.id]: { ...prev[tier.id], price_monthly: e.target.value }
                      }))}
                      placeholder="0.00"
                      disabled={tier.name === 'free'}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Stored as: {Math.round(parseFloat(local.price_monthly || '0') * 100)} cents
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Yearly Price ($ total)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={local.price_yearly}
                      onChange={(e) => setLocalPricing(prev => ({
                        ...prev,
                        [tier.id]: { ...prev[tier.id], price_yearly: e.target.value }
                      }))}
                      placeholder="0.00"
                      disabled={tier.name === 'free'}
                    />
                    {savings > 0 && (
                      <p className="text-xs text-success mt-1">
                        {savings}% savings vs monthly
                      </p>
                    )}
                  </div>
                </div>

                {tier.name !== 'free' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Stripe Monthly Price ID</label>
                      <Input
                        value={local.stripe_price_id_monthly}
                        onChange={(e) => setLocalPricing(prev => ({
                          ...prev,
                          [tier.id]: { ...prev[tier.id], stripe_price_id_monthly: e.target.value }
                        }))}
                        placeholder="price_..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stripe Yearly Price ID</label>
                      <Input
                        value={local.stripe_price_id_yearly}
                        onChange={(e) => setLocalPricing(prev => ({
                          ...prev,
                          [tier.id]: { ...prev[tier.id], stripe_price_id_yearly: e.target.value }
                        }))}
                        placeholder="price_..."
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleSave(tier.id)} 
                  disabled={saving || tier.name === 'free'}
                >
                  Save {tier.name} Pricing
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">Manage system-wide settings and limits</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button onClick={fetchConfigs} variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">
            <Flag className="mr-2 h-4 w-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="mr-2 h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="limits">
            <BarChart className="mr-2 h-4 w-4" />
            Tier Limits
          </TabsTrigger>
          <TabsTrigger value="smtp">
            <Mail className="mr-2 h-4 w-4" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <FeatureFlagsPanel />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingPanel />
        </TabsContent>

        <TabsContent value="limits">
          <TierLimitsPanel />
        </TabsContent>

        <TabsContent value="smtp">
          <SMTPPanel />
        </TabsContent>

        <TabsContent value="security">
          <SecurityPanel />
        </TabsContent>
      </Tabs>

      {/* Audit Log Dialog */}
      <Dialog open={selectedConfigKey !== null} onOpenChange={() => setSelectedConfigKey(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuration Change History</DialogTitle>
            <DialogDescription>
              View all changes made to {selectedConfigKey}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {format(new Date(log.changed_at), 'MMM d, yyyy HH:mm')}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{log.changed_by_email}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Old Value:</p>
                    <pre className="bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.old_value, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium mb-1">New Value:</p>
                    <pre className="bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.new_value, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No change history available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSystemConfig;
