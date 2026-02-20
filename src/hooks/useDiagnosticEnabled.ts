import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDiagnosticEnabled() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('admin-system-config', {
          body: { action: 'get_by_category', category: 'features' },
        });

        if (error) {
          console.error('Error fetching diagnostic setting:', error);
          setEnabled(false);
          return;
        }

        // Find feature_flags config
        const featureFlagsConfig = data.configs?.find(
          (c: any) => c.config_key === 'feature_flags'
        );

        if (featureFlagsConfig?.config_value?.diagnostic_enabled) {
          setEnabled(true);
        } else {
          setEnabled(false);
        }
      } catch (error) {
        console.error('Error checking diagnostic setting:', error);
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSetting();
  }, []);

  return { enabled, loading };
}
