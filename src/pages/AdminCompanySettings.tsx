import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface CompanySettings {
  id?: string;
  address_line1: string;
  address_line2: string;
  city_state_zip: string;
  country: string;
  sales_phone: string;
  support_phone: string;
  emergency_phone: string;
  general_email: string;
  sales_email: string;
  support_email: string;
  business_hours: string;
}

const defaultSettings: CompanySettings = {
  address_line1: '',
  address_line2: '',
  city_state_zip: '',
  country: '',
  sales_phone: '',
  support_phone: '',
  emergency_phone: '',
  general_email: '',
  sales_email: '',
  support_email: '',
  business_hours: '',
};

const AdminCompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const { id, ...settingsWithoutId } = settings;

      const response = await supabase.functions.invoke('manage-company-settings', {
        body: { action: 'update', settings: settingsWithoutId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw response.error;

      toast.success('Company settings saved');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof CompanySettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground">Manage contact information displayed on the Contact page</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Address Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Address</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Address Line 1</Label>
              <Input
                value={settings.address_line1}
                onChange={(e) => updateField('address_line1', e.target.value)}
                placeholder="Building/Suite"
              />
            </div>
            <div>
              <Label>Address Line 2</Label>
              <Input
                value={settings.address_line2}
                onChange={(e) => updateField('address_line2', e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div>
              <Label>City, State, ZIP</Label>
              <Input
                value={settings.city_state_zip}
                onChange={(e) => updateField('city_state_zip', e.target.value)}
                placeholder="City, ST 12345"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={settings.country}
                onChange={(e) => updateField('country', e.target.value)}
                placeholder="US"
              />
            </div>
          </div>
        </Card>

        {/* Phone Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Phone Numbers</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Sales Phone</Label>
              <Input
                value={settings.sales_phone}
                onChange={(e) => updateField('sales_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label>Support Phone</Label>
              <Input
                value={settings.support_phone}
                onChange={(e) => updateField('support_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label>Emergency Phone (24/7)</Label>
              <Input
                value={settings.emergency_phone}
                onChange={(e) => updateField('emergency_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </Card>

        {/* Email Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Email Addresses</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>General Email</Label>
              <Input
                type="email"
                value={settings.general_email}
                onChange={(e) => updateField('general_email', e.target.value)}
                placeholder="info@company.com"
              />
            </div>
            <div>
              <Label>Sales Email</Label>
              <Input
                type="email"
                value={settings.sales_email}
                onChange={(e) => updateField('sales_email', e.target.value)}
                placeholder="sales@company.com"
              />
            </div>
            <div>
              <Label>Support Email</Label>
              <Input
                type="email"
                value={settings.support_email}
                onChange={(e) => updateField('support_email', e.target.value)}
                placeholder="support@company.com"
              />
            </div>
          </div>
        </Card>

        {/* Business Hours Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Business Hours</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Hours Description</Label>
              <Input
                value={settings.business_hours}
                onChange={(e) => updateField('business_hours', e.target.value)}
                placeholder="Monday - Friday: 9:00 AM - 6:00 PM CST"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminCompanySettings;
