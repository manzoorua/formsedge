import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const GettingStarted = () => {
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
                  { label: "Getting Started", href: "/docs/getting-started" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4">Getting Started with FormsEdge</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Welcome to FormsEdge! This guide will walk you through the basics of creating 
                  and managing forms on our platform.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">What You'll Learn</h2>
                <ul className="space-y-2 mb-8">
                  <li>How to create your account and access the dashboard</li>
                  <li>Understanding the FormsEdge interface</li>
                  <li>Creating your first form</li>
                  <li>Publishing and sharing your form</li>
                  <li>Viewing and managing responses</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 1: Create Your Account</h2>
                <p className="mb-4">
                  Getting started with FormsEdge is quick and easy. No credit card required for the free plan.
                </p>
                <ol className="space-y-3 mb-6">
                  <li><strong>Navigate to FormsEdge:</strong> Go to the homepage and click "Create Free Account"</li>
                  <li><strong>Sign Up:</strong> Enter your email and create a password</li>
                  <li><strong>Verify Email:</strong> Check your inbox for a verification link</li>
                  <li><strong>Complete Profile:</strong> Add your name and optional company information</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 2: Access the Dashboard</h2>
                <p className="mb-4">
                  Once logged in, you'll land on your dashboard. This is your central hub for:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Creating Forms:</strong> Start new forms from scratch or templates</li>
                  <li><strong>Managing Forms:</strong> View all your forms, their status, and response counts</li>
                  <li><strong>Recent Activity:</strong> See your latest responses and form interactions</li>
                  <li><strong>Quick Actions:</strong> Access integrations, billing, and settings</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 3: Understanding Form Status</h2>
                <p className="mb-4">
                  Forms in FormsEdge can have three statuses:
                </p>
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <ul className="space-y-3">
                    <li><strong className="text-yellow-600">Draft:</strong> Form is being edited and not accepting responses</li>
                    <li><strong className="text-green-600">Published:</strong> Form is live and accepting responses</li>
                    <li><strong className="text-gray-600">Archived:</strong> Form is no longer active but data is preserved</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Key Features</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Drag & Drop Builder</h3>
                    <p className="text-sm text-muted-foreground">
                      Intuitive interface for creating forms without coding
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Real-time Collaboration</h3>
                    <p className="text-sm text-muted-foreground">
                      Multiple team members can edit forms simultaneously
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Response Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Track views, completions, and drop-off rates
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Powerful Integrations</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with Zapier, webhooks, and more
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">What's Next?</h2>
                <p className="mb-6">
                  Now that you understand the basics, you're ready to build your first form!
                </p>
              </article>

              <DocsFeedback />

              <div className="mt-12 border-t border-border pt-8">
                <h3 className="text-xl font-bold mb-4">Next Steps</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link to="/docs/building-first-form">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          Build Your First Form
                          <ArrowRight className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                          Step-by-step tutorial for creating your first form in 5 minutes
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link to="/docs/form-builder">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          Form Builder Guide
                          <ArrowRight className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                          Learn about all the features in the form builder interface
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GettingStarted;
