import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, X, Crown, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { usePricingData } from "@/hooks/usePricingData";

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { getProPricing, loading } = usePricingData();
  const proPricing = getProPricing();

  const features = [
    {
      name: "Unlimited forms",
      free: true,
      pro: true,
      enterprise: true
    },
    {
      name: "Unlimited responses", 
      free: true,
      pro: true,
      enterprise: true
    },
    {
      name: "Logic jumps & calculations",
      free: true,
      pro: true,
      enterprise: true
    },
    {
      name: "500+ templates",
      free: true,
      pro: true,
      enterprise: true
    },
    {
      name: "Basic integrations",
      free: true,
      pro: true,
      enterprise: true
    },
    {
      name: "Email notifications",
      free: true,
      pro: true,
      enterprise: true
    },
    {
      name: "File uploads",
      free: "10MB",
      pro: "Unlimited",
      enterprise: "Unlimited"
    },
    {
      name: "Custom branding",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Custom domains",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Remove FormsEdge branding",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Team collaboration",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Payment collection",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Advanced analytics",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Partial submissions",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "Priority support",
      free: false,
      pro: true,
      enterprise: true
    },
    {
      name: "SSO & SAML",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Advanced security",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Data residency options",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Custom integrations",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Dedicated support",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "SLA guarantee",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Training & onboarding",
      free: false,
      pro: false,
      enterprise: true
    },
    {
      name: "Custom contracts",
      free: false,
      pro: false,
      enterprise: true
    }
  ];

  return (
    <section className="py-12 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start for free with unlimited forms and responses. 
            Upgrade when you need advanced features.
          </p>
          
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isYearly ? 'bg-primary text-white' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isYearly ? 'bg-primary text-white' : 'text-muted-foreground'
              }`}
            >
              Yearly
              {proPricing.savingsPercent > 0 && (
                <span className="ml-1 text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                  Save {proPricing.savingsPercent}%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <Card className="relative p-8 bg-white shadow-elegant border border-border">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-bold text-foreground">Free Forever</h3>
              </div>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </div>
            
            <div className="mb-8">
              <div className="text-4xl font-bold text-foreground">$0</div>
              <div className="text-muted-foreground">Forever free</div>
            </div>

            <Button className="w-full mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700" size="lg">
              Start Free
            </Button>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {feature.free ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={feature.free ? "text-foreground" : "text-muted-foreground"}>
                    {feature.name}
                    {typeof feature.free === 'string' && (
                      <span className="text-muted-foreground ml-1">({feature.free})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="relative p-8 bg-gradient-primary text-white shadow-primary border-2 border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Crown className="w-4 h-4" />
                <span>Most Popular</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-6 h-6 text-primary-glow" />
                <h3 className="text-2xl font-bold">Pro</h3>
              </div>
              <p className="text-primary-foreground/80">For growing businesses</p>
            </div>
            
            <div className="mb-8">
              <div className="text-4xl font-bold">
                ${isYearly ? proPricing.yearly : proPricing.monthly}
              </div>
              <div className="text-primary-foreground/80">
                per month{isYearly ? ', billed yearly' : ''}
              </div>
              {isYearly && proPricing.savingsAmount > 0 && (
                <div className="text-sm text-primary-glow mt-1">
                  Save ${proPricing.savingsAmount}/year
                </div>
              )}
            </div>

            <Button className="w-full mb-8 bg-green-500 text-white hover:bg-green-600" size="lg">
              Start 14-day trial
            </Button>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {feature.pro ? (
                    <CheckCircle className="w-5 h-5 text-primary-glow flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-primary-foreground/50 flex-shrink-0" />
                  )}
                  <span className={feature.pro ? "text-primary-foreground" : "text-primary-foreground/50"}>
                    {feature.name}
                    {typeof feature.pro === 'string' && (
                      <span className="text-primary-glow ml-1">({feature.pro})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative p-8 bg-white shadow-elegant border border-border">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Enterprise</h3>
              </div>
              <p className="text-muted-foreground">For large organizations</p>
            </div>
            
            <div className="mb-8">
              <div className="text-2xl font-bold text-foreground">Custom pricing</div>
              <div className="text-muted-foreground">Volume discounts available</div>
            </div>

            <Button className="w-full mb-8 bg-gray-600 text-white hover:bg-gray-700" size="lg">
              Contact Sales
            </Button>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground font-medium">Everything in Pro</span>
              </div>
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {feature.enterprise ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={feature.enterprise ? "text-foreground" : "text-muted-foreground"}>
                    {feature.name}
                    {typeof feature.enterprise === 'string' && (
                      <span className="text-muted-foreground ml-1">({feature.enterprise})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Trusted by 50,000+ businesses worldwide
          </p>
          <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>GDPR compliant • EU servers • 99.9% uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;