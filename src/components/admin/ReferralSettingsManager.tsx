import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RotateCcw } from "lucide-react";

interface ReferralSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
}

export function ReferralSettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReferralSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
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
      const initialData = data?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>) || {};
      
      setFormData(initialData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load referral settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingKey: string, newValue: any) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('referral_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${settingKey.replace(/_/g, ' ')} updated successfully`,
      });

      await fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (settingKey: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [settingKey]: {
        ...prev[settingKey],
        [field]: value
      }
    }));
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      for (const [settingKey, value] of Object.entries(formData)) {
        await supabase
          .from('referral_settings')
          .update({ setting_value: value })
          .eq('setting_key', settingKey);
      }

      toast({
        title: "Success",
        description: "All settings updated successfully",
      });

      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Referral Settings</h2>
          <p className="text-muted-foreground">
            Configure referral program parameters and rewards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveAllSettings} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle className="capitalize">
                {setting.setting_key.replace(/_/g, ' ')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {setting.setting_key === 'referral_bonus_amount' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${setting.setting_key}_value`}>Amount ($)</Label>
                    <Input
                      id={`${setting.setting_key}_value`}
                      type="number"
                      step="0.01"
                      value={formData[setting.setting_key]?.value || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, 'value', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${setting.setting_key}_currency`}>Currency</Label>
                    <Input
                      id={`${setting.setting_key}_currency`}
                      value={formData[setting.setting_key]?.currency || 'USD'}
                      onChange={(e) => handleInputChange(setting.setting_key, 'currency', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {setting.setting_key === 'friend_discount_percentage' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${setting.setting_key}_value`}>Discount (%)</Label>
                    <Input
                      id={`${setting.setting_key}_value`}
                      type="number"
                      min="0"
                      max="100"
                      value={formData[setting.setting_key]?.value || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, 'value', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${setting.setting_key}_max`}>Max Discount (%)</Label>
                    <Input
                      id={`${setting.setting_key}_max`}
                      type="number"
                      min="0"
                      max="100"
                      value={formData[setting.setting_key]?.max_discount || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, 'max_discount', parseInt(e.target.value) || 100)}
                    />
                  </div>
                </div>
              )}

              {setting.setting_key === 'maximum_earning_per_referral' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${setting.setting_key}_value`}>Maximum Amount ($)</Label>
                    <Input
                      id={`${setting.setting_key}_value`}
                      type="number"
                      step="0.01"
                      value={formData[setting.setting_key]?.value || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, 'value', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${setting.setting_key}_currency`}>Currency</Label>
                    <Input
                      id={`${setting.setting_key}_currency`}
                      value={formData[setting.setting_key]?.currency || 'USD'}
                      onChange={(e) => handleInputChange(setting.setting_key, 'currency', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {setting.setting_key === 'payment_schedule_days' && (
                <div>
                  <Label htmlFor={`${setting.setting_key}_value`}>Payment Schedule</Label>
                  <Input
                    id={`${setting.setting_key}_value`}
                    value={formData[setting.setting_key]?.value || ''}
                    onChange={(e) => handleInputChange(setting.setting_key, 'value', e.target.value)}
                    placeholder="e.g., 5-7 business days"
                  />
                </div>
              )}

              {setting.setting_key === 'payment_processing_frequency' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${setting.setting_key}_value`}>Frequency</Label>
                    <Input
                      id={`${setting.setting_key}_value`}
                      value={formData[setting.setting_key]?.value || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, 'value', e.target.value)}
                      placeholder="e.g., Monthly, Weekly"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${setting.setting_key}_day`}>Day of Month</Label>
                    <Input
                      id={`${setting.setting_key}_day`}
                      type="number"
                      min="1"
                      max="31"
                      value={formData[setting.setting_key]?.day_of_month || ''}
                      onChange={(e) => handleInputChange(setting.setting_key, 'day_of_month', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => updateSetting(setting.setting_key, formData[setting.setting_key])}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}