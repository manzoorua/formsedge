import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import DocsSearch from "@/components/docs/DocsSearch";
import { Link } from "react-router-dom";
import { 
  Rocket, FileText, BarChart3, Link2, 
  AlertCircle, BookOpen, Code, Users, CreditCard 
} from "lucide-react";

const Docs = () => {
  const categories = [
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: "Getting Started",
      description: "Learn the basics and create your first form",
      links: [
        { title: "Introduction", href: "/docs/getting-started" },
        { title: "Build Your First Form", href: "/docs/building-first-form" },
      ]
    },
    {
      icon: <FileText className="w-8 h-8 text-accent" />,
      title: "Building Forms",
      description: "Master the form builder with detailed guides",
      links: [
        { title: "Form Builder Interface", href: "/docs/form-builder" },
        { title: "URL Parameters & Hidden Fields", href: "/docs/url-parameters" },
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-chart-2" />,
      title: "Managing Responses",
      description: "View, export, and analyze your form data",
      links: [
        { title: "Response Management Guide", href: "/docs/responses" },
      ]
    },
    {
      icon: <Link2 className="w-8 h-8 text-chart-3" />,
      title: "Distribution & Integrations",
      description: "Share forms and connect with other tools",
      links: [
        { title: "Embedding Forms", href: "/docs/embedding" },
        { title: "Integrations Setup", href: "/docs/integrations" },
      ]
    },
    {
      icon: <Code className="w-8 h-8 text-chart-4" />,
      title: "API & Webhooks",
      description: "Programmatic access to your form data",
      links: [
        { title: "API Documentation", href: "/docs/api" },
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-chart-5" />,
      title: "Organization & Team",
      description: "Collaborate with team members on forms",
      links: [
        { title: "Team Collaboration", href: "/docs/team-collaboration" },
      ]
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: "Account & Billing",
      description: "Manage your subscription and account settings",
      links: [
        { title: "Billing & Subscriptions", href: "/docs/billing" },
        { title: "Account Settings", href: "/docs/account" },
      ]
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-destructive" />,
      title: "Troubleshooting",
      description: "Fix common issues and get help",
      links: [
        { title: "Common Issues & Solutions", href: "/docs/troubleshooting" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              <span>Documentation</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">FormsEdge Documentation</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about building amazing forms
            </p>
          </div>

          <DocsSearch />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {categories.map((category, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">
                    {category.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.links.map((link, linkIdx) => (
                      <Link
                        key={linkIdx}
                        to={link.href}
                        className="block text-sm text-primary hover:underline"
                      >
                        → {link.title}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-muted/50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you get started
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Contact Support
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/dashboard" className="text-primary hover:underline font-medium">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Docs;
