import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReferralSettings {
  referral_bonus_amount: { value: number; currency: string };
  friend_discount_percentage: { value: number; max_discount: number };
  maximum_earning_per_referral: { value: number; currency: string };
  payment_schedule_days: { value: string };
  payment_processing_frequency: { value: string; day_of_month: number };
}

export function useReferralSettings() {
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('get-referral-settings');
      
      if (fetchError) throw fetchError;
      
      setSettings(data.settings);
    } catch (err) {
      console.error('Error fetching referral settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('referral-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_settings'
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

  return { settings, loading, error, refetch: fetchSettings };
}