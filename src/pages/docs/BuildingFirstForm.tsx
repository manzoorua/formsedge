import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const BuildingFirstForm = () => {
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
                  { label: "Getting Started", href: "/docs/getting-started" },
                  { label: "Build Your First Form", href: "/docs/building-first-form" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4">Build Your First Form in 5 Minutes</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Follow this step-by-step tutorial to create, customize, and publish your first form. 
                  No technical knowledge required!
                </p>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-bold mb-2 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
                    What You'll Build
                  </h3>
                  <p className="text-sm mb-2">
                    A contact form with name, email, subject, and message fields that you can embed on any website.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estimated time: 5 minutes
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 1: Create a New Form</h2>
                <ol className="space-y-3 mb-6">
                  <li>Log in to your FormsEdge account</li>
                  <li>Click the <strong>"Create Form"</strong> button on your dashboard</li>
                  <li>Choose <strong>"Start from Blank"</strong> or select the <strong>"Contact Form"</strong> template</li>
                  <li>Give your form a name like "Contact Us"</li>
                </ol>

                <div className="bg-muted/50 rounded-lg p-4 mb-8">
                  <p className="text-sm"><strong>💡 Pro Tip:</strong> Starting with a template saves time! You can always customize it later.</p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 2: Add Form Fields</h2>
                <p className="mb-4">
                  The Form Builder has a palette of fields on the left. Let's add the essential fields:
                </p>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Add a Name Field</h3>
                <ol className="space-y-2 mb-6">
                  <li>Drag the <strong>"Text"</strong> field from the palette onto the canvas</li>
                  <li>Click the field to select it</li>
                  <li>In the right sidebar, set:
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>Label: "Your Name"</li>
                      <li>Placeholder: "John Doe"</li>
                      <li>Toggle <strong>"Required"</strong> to ON</li>
                    </ul>
                  </li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Add an Email Field</h3>
                <ol className="space-y-2 mb-6">
                  <li>Drag the <strong>"Email"</strong> field onto the canvas</li>
                  <li>Set Label: "Email Address"</li>
                  <li>Set Placeholder: "john@example.com"</li>
                  <li>Mark as Required</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Add a Subject Field</h3>
                <ol className="space-y-2 mb-6">
                  <li>Drag another <strong>"Text"</strong> field</li>
                  <li>Set Label: "Subject"</li>
                  <li>Mark as Required</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Add a Message Field</h3>
                <ol className="space-y-2 mb-6">
                  <li>Drag a <strong>"Textarea"</strong> field (for longer text)</li>
                  <li>Set Label: "Message"</li>
                  <li>Set Placeholder: "Tell us how we can help..."</li>
                  <li>Mark as Required</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 3: Customize the Design</h2>
                <p className="mb-4">
                  Make your form look great with these customization options:
                </p>
                
                <ol className="space-y-4 mb-6">
                  <li>
                    <strong>Form Settings:</strong> Click the settings icon in the toolbar
                    <ul className="ml-6 mt-2 space-y-1 text-muted-foreground">
                      <li>Set a form title and description</li>
                      <li>Choose colors that match your brand</li>
                      <li>Upload your logo</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Layout:</strong> Adjust field widths and spacing
                    <ul className="ml-6 mt-2 space-y-1 text-muted-foreground">
                      <li>Some fields can be placed side-by-side</li>
                      <li>Use the layout controls to adjust columns</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Thank You Message:</strong> Customize what users see after submitting
                  </li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 4: Preview Your Form</h2>
                <ol className="space-y-2 mb-6">
                  <li>Click the <strong>"Preview"</strong> button in the top toolbar</li>
                  <li>Test the form by filling it out</li>
                  <li>Check how it looks on mobile by resizing your browser</li>
                  <li>Close the preview to make any adjustments</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 5: Publish Your Form</h2>
                <ol className="space-y-2 mb-6">
                  <li>Click the <strong>"Publish"</strong> button in the top-right corner</li>
                  <li>Your form is now live and ready to receive responses!</li>
                  <li>Copy the shareable link or get the embed code</li>
                </ol>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-bold mb-2 flex items-center text-green-800">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Congratulations!
                  </h3>
                  <p className="text-sm text-green-800">
                    You've successfully created your first form. Now you can share it with the world!
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 6: Share Your Form</h2>
                <p className="mb-4">
                  There are multiple ways to share your form:
                </p>
                <ul className="space-y-3 mb-6">
                  <li>
                    <strong>Direct Link:</strong> Share the URL directly via email or social media
                  </li>
                  <li>
                    <strong>Embed on Website:</strong> Get the embed code from the "Embed" tab. Choose from inline, popup, or slider modes, and select your platform (WordPress, Squarespace, Webflow, Shopify, Wix, or HTML) for step-by-step instructions.
                  </li>
                  <li>
                    <strong>QR Code:</strong> Generate a QR code for offline sharing (coming soon)
                  </li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Step 7: View Responses</h2>
                <ol className="space-y-2 mb-6">
                  <li>Navigate to the <strong>"Responses"</strong> tab in your form</li>
                  <li>See all submissions in a table format</li>
                  <li>Click any response to view details</li>
                  <li>Export responses to CSV or Excel</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Next Steps</h2>
                <p className="mb-6">
                  Now that you've created your first form, explore these advanced features:
                </p>
                <ul className="space-y-2 mb-8">
                  <li>Add conditional logic to show/hide fields based on answers</li>
                  <li>Set up email notifications for new responses</li>
                  <li>Create multi-page forms for complex workflows</li>
                  <li>Connect integrations to send data to other tools</li>
                  <li>Add URL parameters to track form sources</li>
                </ul>
              </article>

              <DocsFeedback />

              <div className="mt-12 border-t border-border pt-8">
                <h3 className="text-xl font-bold mb-4">Continue Learning</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link to="/docs/form-builder">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          Form Builder Guide
                          <ArrowRight className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                          Deep dive into all form builder features and capabilities
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link to="/docs/embedding">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          Embedding Forms
                          <ArrowRight className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                          Learn how to embed your form on any website
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

export default BuildingFirstForm;
