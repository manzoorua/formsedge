import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingTier {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number; // in cents
  price_yearly: number | null; // in cents
  max_forms: number | null;
  max_responses_per_form: number | null;
  max_org_members: number | null;
  features: string[] | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

interface FormattedPricing {
  monthly: number; // in dollars
  yearly: number; // in dollars (per month)
  yearlyTotal: number; // in dollars (total yearly)
  savingsPercent: number;
  savingsAmount: number; // in dollars
}

interface UsePricingDataReturn {
  tiers: PricingTier[];
  loading: boolean;
  error: string | null;
  getPricing: (tierName: string) => FormattedPricing;
  getProPricing: () => FormattedPricing;
  refetch: () => Promise<void>;
}

export function usePricingData(): UsePricingDataReturn {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('public_subscription_tiers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      
      setTiers((data as PricingTier[]) || []);
    } catch (err) {
      console.error('Error fetching pricing data:', err);
      setError('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const getPricing = (tierName: string): FormattedPricing => {
    const tier = tiers.find(t => t.name === tierName);
    
    if (!tier) {
      // Return default values based on tier name
      const defaults: Record<string, FormattedPricing> = {
        free: { monthly: 0, yearly: 0, yearlyTotal: 0, savingsPercent: 0, savingsAmount: 0 },
        pro: { monthly: 29, yearly: 20, yearlyTotal: 240, savingsPercent: 31, savingsAmount: 108 },
        enterprise: { monthly: 49.99, yearly: 41.66, yearlyTotal: 499.92, savingsPercent: 17, savingsAmount: 100 },
      };
      return defaults[tierName] || defaults.pro;
    }

    const monthlyDollars = tier.price_monthly / 100;
    
    // Calculate yearly pricing
    // If yearly price is set, use it; otherwise calculate from monthly
    let yearlyPerMonthDollars: number;
    let yearlyTotalDollars: number;
    
    if (tier.price_yearly && tier.price_yearly > 0) {
      yearlyTotalDollars = tier.price_yearly / 100;
      yearlyPerMonthDollars = yearlyTotalDollars / 12;
    } else {
      // Default: ~31% discount for yearly
      yearlyPerMonthDollars = Math.round(monthlyDollars * 0.69 * 100) / 100;
      yearlyTotalDollars = yearlyPerMonthDollars * 12;
    }

    const monthlyTotalYearly = monthlyDollars * 12;
    const savingsAmount = Math.round((monthlyTotalYearly - yearlyTotalDollars) * 100) / 100;
    const savingsPercent = monthlyDollars > 0 
      ? Math.round((savingsAmount / monthlyTotalYearly) * 100) 
      : 0;

    return {
      monthly: monthlyDollars,
      yearly: Math.round(yearlyPerMonthDollars * 100) / 100,
      yearlyTotal: Math.round(yearlyTotalDollars * 100) / 100,
      savingsPercent,
      savingsAmount,
    };
  };

  const getProPricing = (): FormattedPricing => getPricing('pro');

  return {
    tiers,
    loading,
    error,
    getPricing,
    getProPricing,
    refetch: fetchPricing,
  };
}
