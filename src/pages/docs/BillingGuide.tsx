import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { CreditCard, Check, X, Sparkles, Building2, Zap } from "lucide-react";

const BillingGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[250px,1fr] gap-12">
            <DocsSidebar />

            <div>
              <DocsBreadcrumb 
                items={[
                  { label: "Docs", href: "/docs" },
                  { label: "Account", href: "/docs/billing" },
                  { label: "Billing & Subscriptions", href: "/docs/billing" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4 flex items-center">
                  <CreditCard className="w-10 h-10 mr-4 text-primary" />
                  Billing & Subscriptions
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Understand FormsEdge pricing tiers, manage your subscription, and learn about billing options.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Subscription Tiers</h2>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Zap className="w-6 h-6 text-muted-foreground mr-2" />
                      <h3 className="font-bold text-lg">Free</h3>
                    </div>
                    <p className="text-2xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />3 forms</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />100 responses/form</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Basic analytics</li>
                      <li className="flex items-center"><X className="w-4 h-4 text-muted-foreground mr-2" />Team collaboration</li>
                      <li className="flex items-center"><X className="w-4 h-4 text-muted-foreground mr-2" />Custom branding</li>
                      <li className="flex items-center"><X className="w-4 h-4 text-muted-foreground mr-2" />Integrations</li>
                    </ul>
                  </div>
                  
                  <div className="bg-primary/5 border-2 border-primary rounded-lg p-6 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                    <div className="flex items-center mb-4">
                      <Sparkles className="w-6 h-6 text-primary mr-2" />
                      <h3 className="font-bold text-lg">Pro</h3>
                    </div>
                    <p className="text-2xl font-bold mb-4">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Unlimited forms</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />10,000 responses/form</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Advanced analytics</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />3 team members</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Custom branding</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />All integrations</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Building2 className="w-6 h-6 text-chart-3 mr-2" />
                      <h3 className="font-bold text-lg">Enterprise</h3>
                    </div>
                    <p className="text-2xl font-bold mb-4">$49.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Everything in Pro</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Unlimited responses</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />10 team members</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Priority support</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Custom domains</li>
                      <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />SSO (coming soon)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Pricing shown is indicative. Actual prices are configured by administrators and may vary. 
                    Check the <a href="/pricing" className="text-primary hover:underline">Pricing page</a> for current rates.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Monthly vs Yearly Billing</h2>
                
                <p className="mb-4">
                  FormsEdge offers both monthly and yearly billing options:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-bold mb-2">Monthly Billing</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Pay month-to-month</li>
                      <li>• Cancel anytime</li>
                      <li>• Full flexibility</li>
                      <li>• Standard pricing</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2">Yearly Billing</h3>
                    <ul className="text-sm space-y-1 text-green-800">
                      <li>• Pay annually upfront</li>
                      <li>• Save up to 31% vs monthly</li>
                      <li>• Best value for long-term use</li>
                      <li>• Same features as monthly</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Upgrading Your Plan</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">How to Upgrade</h3>
                <ol className="space-y-2 mb-6">
                  <li>Go to <strong>Settings → Billing</strong> in your dashboard</li>
                  <li>Or click <strong>"Upgrade"</strong> when prompted by a feature gate</li>
                  <li>Select your desired plan (Pro or Enterprise)</li>
                  <li>Choose monthly or yearly billing</li>
                  <li>Enter payment details via Stripe's secure checkout</li>
                  <li>Your new features are available immediately</li>
                </ol>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h4 className="font-bold text-blue-800 mb-2">Prorated Billing</h4>
                  <p className="text-sm text-blue-800">
                    When upgrading mid-cycle, you'll only be charged the prorated difference for the remaining days. 
                    Your next full billing cycle starts at the new rate.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Managing Your Subscription</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Stripe Customer Portal</h3>
                <p className="mb-4">
                  Access your Stripe Customer Portal to:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>• View billing history and download invoices</li>
                  <li>• Update payment method</li>
                  <li>• Change billing address</li>
                  <li>• Switch between monthly and yearly billing</li>
                  <li>• Cancel your subscription</li>
                </ul>

                <p className="mb-6">
                  Access the portal from <strong>Settings → Billing → Manage Subscription</strong>.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Downgrading</h3>
                <p className="mb-4">
                  To downgrade to a lower tier:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Go to <strong>Settings → Billing</strong></li>
                  <li>Click <strong>"Manage Subscription"</strong></li>
                  <li>Select a lower tier in the Stripe portal</li>
                  <li>The change takes effect at the end of your current billing period</li>
                </ol>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h4 className="font-bold text-yellow-800 mb-2">Before Downgrading</h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    Make sure you're within the limits of your new plan:
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Archive or delete forms if exceeding form limits</li>
                    <li>• Export important response data</li>
                    <li>• Remove team members if exceeding member limits</li>
                    <li>• Disable integrations that aren't available on the lower tier</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Cancellation & Refunds</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">How to Cancel</h3>
                <ol className="space-y-2 mb-6">
                  <li>Go to <strong>Settings → Billing</strong></li>
                  <li>Click <strong>"Manage Subscription"</strong></li>
                  <li>Select <strong>"Cancel subscription"</strong> in the Stripe portal</li>
                  <li>Confirm cancellation</li>
                </ol>

                <p className="mb-6">
                  Your subscription remains active until the end of your current billing period. 
                  After that, your account reverts to the Free tier.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Refund Policy</h3>
                <div className="bg-card border rounded-lg p-6 mb-8">
                  <p className="mb-4">
                    <strong>30-Day Money-Back Guarantee:</strong> If you're not satisfied with FormsEdge within the first 30 days of your paid subscription, 
                    contact support for a full refund.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    After 30 days, refunds are provided on a case-by-case basis. Yearly subscriptions cancelled after 30 days 
                    are not eligible for partial refunds.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Payment Methods</h2>
                <p className="mb-4">
                  FormsEdge accepts the following payment methods via Stripe:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>• Credit/Debit cards (Visa, Mastercard, American Express, Discover)</li>
                  <li>• Some regional payment methods depending on location</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Invoices & Receipts</h2>
                <p className="mb-4">
                  Access your invoices:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Go to <strong>Settings → Billing → Manage Subscription</strong></li>
                  <li>View your billing history in the Stripe portal</li>
                  <li>Download PDF invoices for any transaction</li>
                </ol>

                <p className="mb-6">
                  Invoices are automatically emailed to your billing email address after each payment.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Frequently Asked Questions</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-bold mb-2">What happens to my forms if I downgrade?</h4>
                    <p className="text-sm text-muted-foreground">
                      Your forms remain intact, but you may lose access to premium features. 
                      If you exceed form limits, you won't be able to create new forms until you're within limits.
                    </p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-bold mb-2">Can I switch from monthly to yearly?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! Go to Manage Subscription in Billing settings. You'll be credited for your remaining monthly period 
                      and charged the yearly rate.
                    </p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-bold mb-2">Do you offer discounts for nonprofits or education?</h4>
                    <p className="text-sm text-muted-foreground">
                      Contact our sales team at sales@formsedge.com to discuss special pricing for qualified organizations.
                    </p>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-bold mb-2">What if my payment fails?</h4>
                    <p className="text-sm text-muted-foreground">
                      Stripe will retry failed payments automatically. You'll receive email notifications to update your payment method. 
                      After multiple failures, your subscription may be paused.
                    </p>
                  </div>
                </div>
              </article>

              <DocsFeedback />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BillingGuide;
