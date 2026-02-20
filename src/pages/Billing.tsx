import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_forms: number;
  max_responses_per_form: number;
  features: any; // JSON type from Supabase
  sort_order: number;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string;
  subscription_status: string;
  subscription_end: string;
  cancel_at_period_end: boolean;
}

export default function Billing() {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription tiers using the secure view
      const { data: tiersData, error: tiersError } = await supabase
        .from("public_subscription_tiers")
        .select("*");

      if (tiersError) throw tiersError;
      setTiers(tiersData || []);

      // Check current subscription
      await checkSubscription();
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscriptionInfo(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleSubscribe = async (plan: string, billingInterval: string = "monthly") => {
    try {
      setActionLoading(plan);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, billing_interval: billingInterval }
      });
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      setActionLoading("portal");
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open customer portal");
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getPlanBadgeVariant = (tierName: string) => {
    if (subscriptionInfo?.subscription_tier === tierName) {
      return "default";
    }
    return "outline";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Please sign in to view billing</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading billing information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Billing & Subscription</h1>
            <p className="text-lg text-muted-foreground">
              Manage your subscription and billing information
            </p>
          </div>

          {/* Current Subscription Card */}
          {subscriptionInfo && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPlanBadgeVariant(subscriptionInfo.subscription_tier)}>
                        {subscriptionInfo.subscription_tier.charAt(0).toUpperCase() + subscriptionInfo.subscription_tier.slice(1)} Plan
                      </Badge>
                      {subscriptionInfo.subscribed && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Active
                        </Badge>
                      )}
                    </div>
                    {subscriptionInfo.subscription_end && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {subscriptionInfo.cancel_at_period_end ? "Expires" : "Renews"} on{" "}
                        {new Date(subscriptionInfo.subscription_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {subscriptionInfo.subscribed && (
                    <Button 
                      variant="outline" 
                      onClick={handleCustomerPortal}
                      disabled={actionLoading === "portal"}
                    >
                      {actionLoading === "portal" ? "Loading..." : "Manage Subscription"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {tiers.map((tier) => (
              <Card key={tier.id} className={`relative ${subscriptionInfo?.subscription_tier === tier.name ? 'ring-2 ring-primary' : ''}`}>
                {subscriptionInfo?.subscription_tier === tier.name && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tier.name.charAt(0).toUpperCase() + tier.name.slice(1)}
                    {tier.name === "pro" && (
                      <Badge variant="secondary">Most Popular</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {tier.price_monthly === 0 ? "Free" : formatPrice(tier.price_monthly)}
                    {tier.price_monthly > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Forms:</strong> {tier.max_forms === -1 ? "Unlimited" : tier.max_forms}
                      </p>
                      <p className="text-sm">
                        <strong>Responses per form:</strong> {tier.max_responses_per_form === -1 ? "Unlimited" : tier.max_responses_per_form}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {(Array.isArray(tier.features) ? tier.features : []).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    {subscriptionInfo?.subscription_tier !== tier.name && (
                      <Button 
                        className="w-full mt-4" 
                        variant={tier.name === "pro" ? "default" : "outline"}
                        onClick={() => handleSubscribe(tier.name)}
                        disabled={actionLoading === tier.name}
                      >
                        {actionLoading === tier.name ? "Loading..." : 
                         tier.price_monthly === 0 ? "Current Plan" : "Subscribe"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Refresh Subscription Button */}
          <div className="text-center">
            <Button variant="outline" onClick={checkSubscription}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh Subscription Status
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}