import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Check, Zap, Shield, BarChart3, Palette, Users, Globe, Code, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Features = () => {
  const featureCategories = [
    {
      title: "Form Builder",
      description: "Create beautiful forms with our intuitive drag-and-drop builder",
      icon: Palette,
      features: [
        "Drag-and-drop interface",
        "Real-time preview",
        "Conditional logic",
        "Custom styling",
        "Mobile responsive",
        "Multi-page forms"
      ]
    },
    {
      title: "Analytics & Insights",
      description: "Understand your form performance with detailed analytics",
      icon: BarChart3,
      features: [
        "Response tracking",
        "Conversion analytics",
        "Drop-off analysis",
        "Export to CSV/Excel",
        "Real-time reporting",
        "Custom dashboards"
      ]
    },
    {
      title: "Security & Compliance",
      description: "Enterprise-grade security for your form data",
      icon: Shield,
      features: [
        "GDPR compliance",
        "Data encryption",
        "SSL protection",
        "Spam filtering",
        "Data residency",
        "Access controls"
      ]
    },
    {
      title: "Integrations",
      description: "Connect with your favorite tools and services",
      icon: Zap,
      features: [
        "6,000+ apps via Zapier",
        "Native integrations",
        "Webhook support",
        "API access",
        "Real-time sync",
        "Custom connections"
      ]
    },
    {
      title: "Collaboration",
      description: "Work together with your team on form creation",
      icon: Users,
      features: [
        "Team workspaces",
        "Role-based permissions",
        "Shared templates",
        "Comment system",
        "Version history",
        "Activity logs"
      ]
    },
    {
      title: "Publishing & Sharing",
      description: "Share your forms anywhere on the web",
      icon: Globe,
      features: [
        "Custom domains",
        "Embed anywhere",
        "Social sharing",
        "QR codes",
        "Popup forms",
        "Widget integration"
      ]
    }
  ];

  const comparisonFeatures = [
    { name: "Form fields", free: "Basic fields", pro: "All field types + custom" },
    { name: "Responses per month", free: "100", pro: "Unlimited" },
    { name: "File uploads", free: "10MB total", pro: "10GB per form" },
    { name: "Custom branding", free: "✗", pro: "✓" },
    { name: "Analytics", free: "Basic", pro: "Advanced" },
    { name: "Integrations", free: "Limited", pro: "All integrations" },
    { name: "Support", free: "Community", pro: "Priority support" }
  ];

  const faqs = [
    {
      question: "How does the drag-and-drop builder work?",
      answer: "Our intuitive builder lets you add fields by simply dragging them onto your form canvas. You can rearrange, customize, and preview changes in real-time without any coding knowledge. It's as easy as building with blocks!"
    },
    {
      question: "Can I use conditional logic to show/hide fields?",
      answer: "Yes! Create smart forms with conditional logic that shows or hides fields based on user responses. Build branching paths, calculate scores, and direct users to different endings based on their answers."
    },
    {
      question: "What types of forms can I create?",
      answer: "You can create any type of form including surveys, lead capture forms, contact forms, registration forms, quizzes, order forms, feedback forms, application forms, and more. Our 500+ templates cover most use cases."
    },
    {
      question: "How do integrations work?",
      answer: "Connect your forms to 6,000+ apps through Zapier, or use native integrations with popular tools like Google Sheets, Slack, and Calendly. Data flows automatically when someone submits a form - no manual export needed."
    },
    {
      question: "Can I customize the look and feel of my forms?",
      answer: "Absolutely! Customize colors, fonts, backgrounds, button styles, and layouts to match your brand. Add your logo, use custom domains, and remove our branding on Pro plans for a completely white-label experience."
    },
    {
      question: "Are forms mobile-responsive automatically?",
      answer: "Yes! Every form is automatically optimized for mobile, tablet, and desktop. Our responsive design ensures your forms look perfect and work smoothly on any device with touch-friendly controls."
    },
    {
      question: "What analytics can I track?",
      answer: "Track views, submissions, conversion rates, completion times, drop-off points, and field-level analytics. See where users abandon forms and optimize for better results with our advanced analytics dashboard (Pro plan)."
    },
    {
      question: "Can multiple team members work on the same form?",
      answer: "Yes! With our Team Collaboration feature (Pro plan), multiple team members can work together on forms, share templates, manage responses, and assign roles with different permission levels."
    },
    {
      question: "Is my data secure and GDPR compliant?",
      answer: "Yes! We store all data on secure EU AWS servers with end-to-end encryption. We're fully GDPR compliant with data processing agreements, right to deletion, data export, and privacy controls built-in."
    },
    {
      question: "Can I embed forms on my website?",
      answer: "Yes! Embed forms using three flexible modes: inline (directly in your page), popup (modal overlay), or slider (side tab trigger). Choose your website platform (WordPress, Squarespace, Webflow, Shopify, Wix, or HTML) and get step-by-step embedding instructions tailored to your platform. Works everywhere!"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-16 pb-10 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Everything You Need to Build
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Amazing Forms</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            From simple contact forms to complex surveys, our feature-rich platform helps you create, 
            customize, and optimize forms that convert visitors into customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Start Building Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Powerful Features for Every Use Case</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a startup or enterprise, our comprehensive feature set scales with your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-10 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Free vs Pro Features</h2>
            <p className="text-lg text-muted-foreground">
              Start free and upgrade when you need more advanced features.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-6 border-r">
                  <h3 className="font-semibold text-foreground">Feature</h3>
                </div>
                <div className="p-6 border-r text-center">
                  <h3 className="font-semibold text-foreground">Free Forever</h3>
                </div>
                <div className="p-6 text-center bg-primary/5">
                  <h3 className="font-semibold text-foreground">Pro</h3>
                  <Badge className="mt-1">Most Popular</Badge>
                </div>
              </div>
              
              {comparisonFeatures.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 gap-0 border-t">
                  <div className="p-4 border-r">
                    <span className="text-sm text-foreground">{feature.name}</span>
                  </div>
                  <div className="p-4 border-r text-center">
                    <span className="text-sm text-muted-foreground">{feature.free}</span>
                  </div>
                  <div className="p-4 text-center bg-primary/5">
                    <span className="text-sm font-medium text-foreground">{feature.pro}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Common Questions About
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Our Features
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about what FormsEdge can do for you.
            </p>
          </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b">
                <AccordionTrigger className="text-left hover:no-underline py-4 px-6">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold text-base text-foreground">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-muted-foreground text-sm leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Build Your First Form?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of businesses using FormsEdge to collect data, generate leads, and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/templates">Browse Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;