import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save, RotateCcw, History, DollarSign, Percent, Calendar, Settings, Eye, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface ReferralSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  is_active: boolean;
  updated_at: string;
  created_by: string;
}

interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_table: string;
  target_id: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const EnhancedReferralSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<ReferralSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchAuditLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .eq('is_active', true)
        .order('setting_key');

      if (error) throw error;

      setSettings(data || []);
      
      // Initialize form data
      const initialFormData: Record<string, any> = {};
      data?.forEach((setting) => {
        initialFormData[setting.setting_key] = setting.setting_value;
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referral settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .eq('target_table', 'referral_settings')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const validateSettings = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate referral bonus amount
    const bonusAmount = formData.referral_bonus_amount?.value;
    if (bonusAmount && (bonusAmount < 0 || bonusAmount > 1000)) {
      errors.push({
        field: 'referral_bonus_amount',
        message: 'Bonus amount must be between $0 and $1000'
      });
    }

    // Validate discount percentage
    const discountPercentage = formData.friend_discount_percentage?.value;
    if (discountPercentage && (discountPercentage < 0 || discountPercentage > 100)) {
      errors.push({
        field: 'friend_discount_percentage',
        message: 'Discount percentage must be between 0% and 100%'
      });
    }

    // Validate maximum earning
    const maxEarning = formData.maximum_earning_per_referral?.value;
    if (maxEarning && (maxEarning < 0 || maxEarning > 10000)) {
      errors.push({
        field: 'maximum_earning_per_referral',
        message: 'Maximum earning must be between $0 and $10,000'
      });
    }

    // Validate payment schedule days
    const scheduleValue = formData.payment_schedule_days?.value;
    if (scheduleValue && !['weekly', 'monthly', 'quarterly'].includes(scheduleValue)) {
      errors.push({
        field: 'payment_schedule_days',
        message: 'Payment schedule must be weekly, monthly, or quarterly'
      });
    }

    return errors;
  };

  const updateSetting = async (settingKey: string, newValue: any) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('referral_settings')
        .update({ setting_value: newValue, updated_at: new Date().toISOString() })
        .eq('setting_key', settingKey);

      if (error) throw error;

      await fetchSettings();
      await fetchAuditLogs();
      
      toast({
        title: "Success",
        description: `${settingKey} updated successfully`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: `Failed to update ${settingKey}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      // Validate all settings
      const errors = validateSettings();
      setValidationErrors(errors);
      
      if (errors.length > 0) {
        toast({
          title: "Validation Error",
          description: "Please fix the validation errors before saving",
          variant: "destructive",
        });
        return;
      }

      // Update all settings
      const updates = Object.entries(formData).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('referral_settings')
          .update({ 
            setting_value: update.setting_value, 
            updated_at: update.updated_at 
          })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      await fetchSettings();
      await fetchAuditLogs();
      
      toast({
        title: "Success",
        description: "All settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving all settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    const initialFormData: Record<string, any> = {};
    settings.forEach((setting) => {
      initialFormData[setting.setting_key] = setting.setting_value;
    });
    setFormData(initialFormData);
    setValidationErrors([]);
    toast({
      title: "Reset",
      description: "Settings reset to saved values",
    });
  };

  const handleInputChange = (settingKey: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [settingKey]: {
        ...prev[settingKey],
        [field]: value
      }
    }));
    
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(error => error.field !== settingKey));
  };

  const getValidationError = (field: string) => {
    return validationErrors.find(error => error.field === field);
  };

  const renderSettingCard = (setting: ReferralSetting) => {
    const error = getValidationError(setting.setting_key);
    
    return (
      <Card key={setting.id} className={`relative ${error ? 'border-destructive' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {getSettingIcon(setting.setting_key)}
              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <Badge variant={setting.is_active ? "default" : "secondary"}>
              {setting.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardDescription>{setting.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          {renderSettingInput(setting)}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Last updated: {format(new Date(setting.updated_at), 'MMM dd, yyyy HH:mm')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSetting(setting.setting_key, formData[setting.setting_key])}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getSettingIcon = (settingKey: string) => {
    switch (settingKey) {
      case 'referral_bonus_amount':
      case 'maximum_earning_per_referral':
        return <DollarSign className="h-4 w-4" />;
      case 'friend_discount_percentage':
        return <Percent className="h-4 w-4" />;
      case 'payment_schedule_days':
      case 'payment_processing_frequency':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const renderSettingInput = (setting: ReferralSetting) => {
    const currentValue = formData[setting.setting_key] || setting.setting_value;

    switch (setting.setting_key) {
      case 'referral_bonus_amount':
      case 'maximum_earning_per_referral':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${setting.setting_key}_value`}>Amount ($)</Label>
              <Input
                id={`${setting.setting_key}_value`}
                type="number"
                min="0"
                max="10000"
                step="0.01"
                value={currentValue?.value || 0}
                onChange={(e) => handleInputChange(setting.setting_key, 'value', parseFloat(e.target.value) || 0)}
                className={getValidationError(setting.setting_key) ? 'border-destructive' : ''}
              />
            </div>
            <div>
              <Label htmlFor={`${setting.setting_key}_currency`}>Currency</Label>
              <Input
                id={`${setting.setting_key}_currency`}
                value={currentValue?.currency || 'USD'}
                onChange={(e) => handleInputChange(setting.setting_key, 'currency', e.target.value)}
                readOnly
              />
            </div>
          </div>
        );

      case 'friend_discount_percentage':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${setting.setting_key}_value`}>Percentage (%)</Label>
              <Input
                id={`${setting.setting_key}_value`}
                type="number"
                min="0"
                max="100"
                step="1"
                value={currentValue?.value || 0}
                onChange={(e) => handleInputChange(setting.setting_key, 'value', parseInt(e.target.value) || 0)}
                className={getValidationError(setting.setting_key) ? 'border-destructive' : ''}
              />
            </div>
            <div>
              <Label htmlFor={`${setting.setting_key}_max_discount`}>Max Discount ($)</Label>
              <Input
                id={`${setting.setting_key}_max_discount`}
                type="number"
                min="0"
                step="0.01"
                value={currentValue?.max_discount || 0}
                onChange={(e) => handleInputChange(setting.setting_key, 'max_discount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        );

      case 'payment_schedule_days':
        return (
          <div>
            <Label htmlFor={`${setting.setting_key}_value`}>Schedule</Label>
            <select
              id={`${setting.setting_key}_value`}
              value={currentValue?.value || 'monthly'}
              onChange={(e) => handleInputChange(setting.setting_key, 'value', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        );

      case 'payment_processing_frequency':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${setting.setting_key}_value`}>Frequency</Label>
              <select
                id={`${setting.setting_key}_value`}
                value={currentValue?.value || 'monthly'}
                onChange={(e) => handleInputChange(setting.setting_key, 'value', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <Label htmlFor={`${setting.setting_key}_day_of_month`}>Day of Month</Label>
              <Input
                id={`${setting.setting_key}_day_of_month`}
                type="number"
                min="1"
                max="31"
                value={currentValue?.day_of_month || 1}
                onChange={(e) => handleInputChange(setting.setting_key, 'day_of_month', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        );

      case 'referral_program_enabled':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={`${setting.setting_key}_enabled`}
              checked={currentValue?.enabled || false}
              onCheckedChange={(checked) => handleInputChange(setting.setting_key, 'enabled', checked)}
            />
            <Label htmlFor={`${setting.setting_key}_enabled`}>
              {currentValue?.enabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      default:
        return (
          <div>
            <Label>Value (JSON)</Label>
            <pre className="p-2 bg-muted rounded text-sm">
              {JSON.stringify(currentValue, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Referral Settings</h1>
          <p className="text-muted-foreground">Manage your referral program configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={saveAllSettings}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save All Changes
            </Button>
            
            <Button
              variant="outline"
              onClick={resetSettings}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            {validationErrors.length > 0 && (
              <Badge variant="destructive">
                {validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {settings.map(renderSettingCard)}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Changes
              </CardTitle>
              <CardDescription>
                Audit trail of referral settings modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Setting</TableHead>
                    <TableHead>Old Value</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.new_values?.setting_key || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.old_values?.setting_value ? 
                          JSON.stringify(log.old_values.setting_value).substring(0, 50) + '...' : 
                          '-'
                        }
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.new_values?.setting_value ? 
                          JSON.stringify(log.new_values.setting_value).substring(0, 50) + '...' : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {auditLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReferralSettingsManager;