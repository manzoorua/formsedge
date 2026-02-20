import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatbotConfig {
  enabled: boolean;
  widgetId: string;
  initialState: 'closed' | 'minimized' | 'open';
  mode?: 'app' | 'iframe';
}

export function useChatbotSettings() {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('chatbot_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['chatbot_enabled', 'chatbot_config']);

      if (fetchError) throw fetchError;

      const settings = data?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>) || {};

      const enabled = settings.chatbot_enabled?.enabled || false;
      const chatbotConfig = settings.chatbot_config || {};

      setConfig({
        enabled,
        widgetId: chatbotConfig.widgetId || 'widget_7243353be9689ba901ea6816',
        initialState: chatbotConfig.initialState || 'closed',
        mode: chatbotConfig.mode || 'app',
      });
    } catch (err) {
      console.error('Error fetching chatbot settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<ChatbotConfig>) => {
    try {
      const promises = [];

      if ('enabled' in updates) {
        promises.push(
          supabase
            .from('chatbot_settings')
            .update({ setting_value: { enabled: updates.enabled } })
            .eq('setting_key', 'chatbot_enabled')
        );
      }

      if (Object.keys(updates).some(key => key !== 'enabled')) {
        const configUpdates = { ...config };
        Object.assign(configUpdates, updates);
        delete (configUpdates as any).enabled;

        promises.push(
          supabase
            .from('chatbot_settings')
            .update({ setting_value: configUpdates })
            .eq('setting_key', 'chatbot_config')
        );
      }

      const results = await Promise.all(promises);
      const hasError = results.some(result => result.error);

      if (hasError) {
        throw new Error('Failed to update settings');
      }

      await fetchSettings();
      return true;
    } catch (err) {
      console.error('Error updating chatbot settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('chatbot-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbot_settings'
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { config, loading, error, updateSettings, refetch: fetchSettings };
}