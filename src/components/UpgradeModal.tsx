import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricingData } from '@/hooks/usePricingData';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  { name: 'Remove FormsEdge branding', included: true },
  { name: 'Unlimited forms', included: true },
  { name: 'Unlimited responses per form', included: true },
  { name: 'File uploads & attachments', included: true },
  { name: 'Email notifications', included: true },
  { name: 'Custom domains', included: true },
  { name: 'Advanced analytics', included: true },
  { name: 'Team collaboration', included: true },
  { name: 'API access', included: true },
  { name: 'Priority support', included: true },
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();
  const { currentTier } = useSubscription();
  const { getProPricing } = usePricingData();
  const proPricing = getProPricing();

  const pricing = {
    monthly: { price: proPricing.monthly, total: proPricing.monthly },
    yearly: { price: proPricing.yearly, total: proPricing.yearlyTotal, savings: proPricing.savingsAmount }
  };

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/billing');
  };

  if (currentTier !== 'free') return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Upgrade to PRO
          </DialogTitle>
          <p className="text-muted-foreground text-center">
            Unlock powerful features and remove limitations
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center">
            <div className="bg-muted rounded-lg p-1 flex">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingInterval === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingInterval === 'yearly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                {proPricing.savingsPercent > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-success text-white text-xs px-1">
                    Save {proPricing.savingsPercent}%
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold">${pricing[billingInterval].price}</span>
              <div className="text-left">
                <div className="text-sm text-muted-foreground">per month</div>
                {billingInterval === 'yearly' && (
                  <div className="text-xs text-success">billed annually</div>
                )}
              </div>
            </div>
            {billingInterval === 'yearly' && (
              <p className="text-sm text-muted-foreground">
                Save ${pricing.yearly.savings} per year
              </p>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center mb-4">Everything in PRO:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    feature.included ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trial Notice */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="font-medium text-sm">14-day free trial</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cancel anytime during your trial period. No questions asked.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-primary hover:opacity-90 text-white shadow-primary"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}