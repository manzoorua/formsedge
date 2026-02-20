import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Card } from "@/components/ui/card";
import { CheckCircle, HelpCircle } from "lucide-react";

const Pricing = () => {
  const faqs = [
    {
      question: "How is this different from Typeform?",
      answer: "We offer unlimited forms and responses on our free plan, while Typeform limits you to 10 responses. Our Pro plan costs $20-29/month vs Typeform's $25-83/month for similar features."
    },
    {
      question: "Can I really get unlimited responses for free?",
      answer: "Yes! Unlike other form builders, we don't limit your responses on the free plan. Create as many forms as you want and collect unlimited responses without any hidden costs."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely! You can cancel your Pro subscription at any time from your account settings. You'll continue to have Pro access until the end of your billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Pro, contact us within 30 days for a full refund."
    },
    {
      question: "How do custom domains work?",
      answer: "With Pro, you can host your forms on your own domain (like forms.yoursite.com). We provide simple DNS instructions to set it up in minutes."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <PricingSection />
        
        {/* FAQ Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Frequently Asked
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about our pricing and features.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <HelpCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                How We Compare to
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  Typeform
                </span>
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-6 font-semibold">Feature</th>
                      <th className="text-center p-6 font-semibold text-primary">FormsEdge</th>
                      <th className="text-center p-6 font-semibold text-muted-foreground">Typeform</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-6">Free plan responses</td>
                      <td className="p-6 text-center">
                        <div className="flex justify-center">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Unlimited</div>
                      </td>
                      <td className="p-6 text-center text-muted-foreground">10 per month</td>
                    </tr>
                    <tr>
                      <td className="p-6">Starting price</td>
                      <td className="p-6 text-center font-semibold text-primary">$20/month</td>
                      <td className="p-6 text-center text-muted-foreground">$25/month</td>
                    </tr>
                    <tr>
                      <td className="p-6">Custom branding</td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-6">Payment collection</td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-6">Logic jumps</td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                        <div className="text-sm text-muted-foreground mt-1">Free plan</div>
                      </td>
                      <td className="p-6 text-center">
                        <CheckCircle className="w-5 h-5 text-success mx-auto" />
                        <div className="text-sm text-muted-foreground mt-1">Paid only</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;