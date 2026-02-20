import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  Users, 
  Calendar,
  FileText,
  Globe,
  Database,
  Webhook,
  Settings
} from "lucide-react";

const Integrations = () => {
  const popularIntegrations = [
    {
      name: "Google Workspace",
      description: "Connect forms to Google Sheets, Docs, and Drive",
      icon: "📊",
      category: "Productivity",
      isPremium: false
    },
    {
      name: "Slack",
      description: "Get instant notifications in your Slack channels",
      icon: "💬",
      category: "Communication",
      isPremium: false
    },
    {
      name: "Mailchimp",
      description: "Add form submissions directly to your email lists",
      icon: "📧",
      category: "Marketing",
      isPremium: false
    },
    {
      name: "Stripe",
      description: "Accept payments directly through your forms",
      icon: "💳",
      category: "Payments",
      isPremium: true
    },
    {
      name: "HubSpot",
      description: "Sync leads and contacts with your CRM",
      icon: "🎯",
      category: "CRM",
      isPremium: true
    },
    {
      name: "n8n",
      description: "Connect to 6,000+ apps with automation workflows",
      icon: "⚡",
      category: "Automation",
      isPremium: false
    }
  ];

  const integrationCategories = [
    {
      title: "Marketing & CRM",
      description: "Connect with your marketing tools and customer relationship management systems",
      icon: Users,
      integrations: ["HubSpot", "Salesforce", "Pipedrive", "ActiveCampaign", "ConvertKit", "Klaviyo"]
    },
    {
      title: "Communication",
      description: "Get notified and collaborate across your communication platforms",
      icon: MessageSquare,
      integrations: ["Slack", "Discord", "Microsoft Teams", "Telegram", "WhatsApp", "SMS"]
    },
    {
      title: "Analytics & Tracking",
      description: "Track form performance and user behavior with analytics tools",
      icon: BarChart3,
      integrations: ["Google Analytics", "Mixpanel", "Hotjar", "Facebook Pixel", "LinkedIn Insight", "Segment"]
    },
    {
      title: "Productivity",
      description: "Streamline workflows with your favorite productivity applications",
      icon: FileText,
      integrations: ["Google Workspace", "Microsoft 365", "Notion", "Airtable", "Trello", "Asana"]
    },
    {
      title: "Payments",
      description: "Accept payments and process transactions securely",
      icon: CreditCard,
      integrations: ["Stripe", "PayPal", "Square", "Razorpay", "Mollie", "Paddle"]
    },
    {
      title: "Automation",
      description: "Automate workflows and connect with thousands of apps",
      icon: Zap,
      integrations: ["n8n", "Make", "Microsoft Power Automate", "IFTTT", "Automate.io"]
    }
  ];

  const features = [
    {
      title: "Native Integrations",
      description: "Direct connections with popular services for seamless data flow",
      icon: Globe
    },
    {
      title: "n8n Hub",
      description: "Access to 6,000+ apps through our n8n integration",
      icon: Zap
    },
    {
      title: "Webhook Support",
      description: "Custom integrations for developers with real-time data",
      icon: Webhook
    },
    {
      title: "API Access",
      description: "Full REST API for custom integrations and workflows",
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Connect with
            <span className="bg-gradient-primary bg-clip-text text-transparent"> 6,000+ Apps</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Seamlessly integrate your forms with the tools you already use. From CRM systems to marketing platforms, 
            automate your workflows and never miss a lead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Start Connecting</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">View Integration Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Integrations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Integrations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with these popular integrations that thousands of businesses rely on daily.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularIntegrations.map((integration, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {integration.category}
                      </Badge>
                    </div>
                    {integration.isPremium && (
                      <Badge className="ml-auto">PRO</Badge>
                    )}
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Integration Categories</h2>
            <p className="text-lg text-muted-foreground">
              Explore integrations by category to find the perfect tools for your workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {integrationCategories.map((category, index) => {
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
                    <div className="flex flex-wrap gap-2">
                      {category.integrations.map((integration, integrationIndex) => (
                        <Badge key={integrationIndex} variant="secondary" className="text-xs">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Integration Features</h2>
            <p className="text-lg text-muted-foreground">
              Powerful integration capabilities to connect your forms with any service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zapier Highlight */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Powered by n8n
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Connect your forms to over 6,000 apps with our n8n integration. 
              Automate workflows, sync data, and eliminate manual work.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">6,000+</div>
                <div className="text-sm text-muted-foreground">Apps Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                <div className="text-sm text-muted-foreground">Data Sync</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">No Code</div>
                <div className="text-sm text-muted-foreground">Setup Required</div>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link to="/auth">Start Automating</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Connect Your Forms?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start building automated workflows today. Connect your forms to the tools you love 
            and watch your productivity soar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Integrations;