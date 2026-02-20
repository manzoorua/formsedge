import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const UrlParametersGuide = () => {
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
                  { label: "Building Forms", href: "/docs/form-builder" },
                  { label: "URL Parameters", href: "/docs/url-parameters" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 inline-block">
                  <span className="text-sm font-medium text-primary">✨ NEW FEATURE</span>
                </div>

                <h1 className="text-4xl font-bold mb-4">URL Parameters & Hidden Fields</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Capture context data from URLs to track marketing campaigns, user IDs, 
                  and other metadata with your form responses.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">What are URL Parameters?</h2>
                <p className="mb-4">
                  URL parameters (also called query parameters) are pieces of data passed in the URL 
                  after a question mark. They allow you to capture context about where your form 
                  is being filled out from.
                </p>

                <div className="bg-muted/50 rounded-lg p-4 mb-8">
                  <p className="text-sm font-mono">
                    https://yoursite.com/form?<span className="text-primary font-bold">source=email&campaign=summer2024</span>
                  </p>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Common Use Cases</h3>
                <ul className="space-y-2 mb-8">
                  <li><strong>Marketing Attribution:</strong> Track which campaigns drive responses (UTM parameters)</li>
                  <li><strong>User Identification:</strong> Pre-fill forms with user IDs from your app</li>
                  <li><strong>A/B Testing:</strong> Track which variant of your landing page converts better</li>
                  <li><strong>Source Tracking:</strong> Know if responses came from email, social media, ads, etc.</li>
                  <li><strong>Session Data:</strong> Pass along session IDs or other contextual information</li>
                  <li><strong>Personalization:</strong> Customize form experience based on URL data</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Setting Up URL Parameters</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Step 1: Configure Parameters</h3>
                <ol className="space-y-3 mb-6">
                  <li>Open your form in the Form Builder</li>
                  <li>Click <strong>Settings</strong> in the top toolbar</li>
                  <li>Go to the <strong>Parameters</strong> tab</li>
                  <li>Click <strong>Add Parameter</strong></li>
                  <li>Enter parameter details:
                    <ul className="ml-6 mt-2 space-y-1">
                      <li><strong>Name:</strong> The URL parameter key (e.g., <code>utm_source</code>)</li>
                      <li><strong>Label:</strong> Friendly display name</li>
                      <li><strong>Description:</strong> What this parameter tracks</li>
                      <li><strong>Default Value:</strong> Fallback if parameter is missing</li>
                    </ul>
                  </li>
                </ol>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h4 className="font-bold mb-2">💡 Naming Best Practices</h4>
                  <ul className="text-sm space-y-1">
                    <li>Use lowercase with underscores: <code>user_id</code>, <code>campaign_name</code></li>
                    <li>Be descriptive but concise</li>
                    <li>Follow UTM conventions for marketing: <code>utm_source</code>, <code>utm_medium</code>, <code>utm_campaign</code></li>
                  </ul>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Step 2: Configure Visibility</h3>
                <p className="mb-4">
                  Control where parameter data appears:
                </p>
                <ul className="space-y-3 mb-6">
                  <li>
                    <strong>Include in Responses:</strong> Show in the response detail view
                    <p className="text-sm text-muted-foreground">Useful for investigating individual responses</p>
                  </li>
                  <li>
                    <strong>Visible in Exports:</strong> Include in CSV/Excel exports
                    <p className="text-sm text-muted-foreground">Essential for analytics and reporting</p>
                  </li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Using Parameters in Embeds</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Method 1: Static Values</h3>
                <p className="mb-4">
                  Set fixed parameter values in your embed code. Great for identifying the page 
                  or source where the form is embedded.
                </p>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<div 
  data-fe-form="YOUR_FORM_ID"
  data-fe-hidden="source=homepage,variant=hero"
></div>
<script src="https://yoursite.com/embed.js"></script>`}
                  </pre>
                </div>

                <p className="text-sm text-muted-foreground mb-8">
                  This sets <code>source=homepage</code> and <code>variant=hero</code> for all responses from this embed.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Method 2: Transitive Parameters</h3>
                <p className="mb-4">
                  Automatically capture parameters from the host page's URL. Perfect for 
                  preserving UTM parameters throughout the user journey.
                </p>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<div 
  data-fe-form="YOUR_FORM_ID"
  data-fe-transitive-params="utm_source,utm_medium,utm_campaign"
></div>
<script src="https://yoursite.com/embed.js"></script>`}
                  </pre>
                </div>

                <p className="text-sm text-muted-foreground mb-8">
                  If someone visits <code>yoursite.com/landing?utm_source=google&utm_campaign=spring</code>, 
                  those parameters are automatically captured with the form response.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Method 3: Combining Both</h3>
                <p className="mb-4">
                  Use static and transitive together for maximum tracking:
                </p>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<div 
  data-fe-form="YOUR_FORM_ID"
  data-fe-hidden="page=pricing,variant=b"
  data-fe-transitive-params="utm_source,utm_campaign,user_id"
></div>
<script src="https://yoursite.com/embed.js"></script>`}
                  </pre>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Direct Link Parameters</h2>
                <p className="mb-4">
                  When sharing form links directly, add parameters to the URL:
                </p>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`https://yoursite.com/f/YOUR_FORM_ID?source=email&campaign=newsletter`}
                  </pre>
                </div>

                <p className="mb-8">
                  All configured parameters will be captured automatically from the URL.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Common Parameter Examples</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Marketing Campaign Tracking</h3>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="font-mono text-sm mb-3">Parameters to configure:</p>
                  <ul className="space-y-2 text-sm font-mono">
                    <li><code>utm_source</code> - Traffic source (google, facebook, email)</li>
                    <li><code>utm_medium</code> - Marketing medium (cpc, social, newsletter)</li>
                    <li><code>utm_campaign</code> - Campaign name (spring_sale_2024)</li>
                    <li><code>utm_content</code> - Ad variation (hero_banner, sidebar_ad)</li>
                    <li><code>utm_term</code> - Paid search keywords</li>
                  </ul>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">User Context Tracking</h3>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="font-mono text-sm mb-3">Parameters to configure:</p>
                  <ul className="space-y-2 text-sm font-mono">
                    <li><code>user_id</code> - Internal user identifier</li>
                    <li><code>account_type</code> - Subscription tier or account type</li>
                    <li><code>session_id</code> - Session tracking ID</li>
                    <li><code>referrer</code> - Previous page or referrer</li>
                  </ul>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">A/B Testing</h3>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="font-mono text-sm mb-3">Parameters to configure:</p>
                  <ul className="space-y-2 text-sm font-mono">
                    <li><code>test_variant</code> - A/B test variant (control, variant_a, variant_b)</li>
                    <li><code>experiment_id</code> - Experiment identifier</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Viewing Captured Parameters</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">In Response Details</h3>
                <ol className="space-y-2 mb-6">
                  <li>Go to your form's <strong>Responses</strong> tab</li>
                  <li>Click any response to view details</li>
                  <li>Scroll to the <strong>URL Parameters</strong> section</li>
                  <li>See all captured parameter values</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">In Exports</h3>
                <ol className="space-y-2 mb-6">
                  <li>Go to <strong>Responses</strong> tab</li>
                  <li>Click <strong>Export</strong></li>
                  <li>Parameters marked as "Visible in Exports" will be included as columns</li>
                  <li>Analyze in Excel, Google Sheets, or your analytics tool</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Security & Privacy</h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h4 className="font-bold mb-2 text-yellow-800">⚠️ Important Considerations</h4>
                  <ul className="text-sm space-y-2 text-yellow-800">
                    <li><strong>Don't pass sensitive data:</strong> Never include passwords, API keys, or personal information in URLs</li>
                    <li><strong>User consent:</strong> Ensure you have consent to collect tracking data</li>
                    <li><strong>GDPR compliance:</strong> Some parameters may be considered personal data</li>
                    <li><strong>URL length limits:</strong> Keep parameter values concise (URLs have size limits)</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Troubleshooting</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Parameters Not Being Captured</h3>
                <ul className="space-y-2 mb-6">
                  <li>✓ Verify parameter name matches exactly (case-sensitive)</li>
                  <li>✓ Check that parameter is configured in Form Settings → Parameters</li>
                  <li>✓ For transitive params, ensure they're listed in <code>data-fe-transitive-params</code></li>
                  <li>✓ Test with a fresh browser or incognito window</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Parameters Showing Empty</h3>
                <ul className="space-y-2 mb-6">
                  <li>✓ Check if a default value is set</li>
                  <li>✓ Verify the parameter is in the URL when form loads</li>
                  <li>✓ For transitive params, ensure host page URL contains them</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Best Practices</h2>
                <ul className="space-y-3 mb-8">
                  <li><strong>Consistent naming:</strong> Use the same parameter names across all your forms</li>
                  <li><strong>Document your parameters:</strong> Keep a list of what each parameter means</li>
                  <li><strong>Set sensible defaults:</strong> Provide fallback values for missing parameters</li>
                  <li><strong>Test thoroughly:</strong> Verify parameters work in all embed scenarios</li>
                  <li><strong>Review regularly:</strong> Check which parameters are actually being used</li>
                  <li><strong>Export for analysis:</strong> Regularly export data to analyze campaign performance</li>
                </ul>
              </article>

              <DocsFeedback />

              <div className="mt-12 border-t border-border pt-8">
                <h3 className="text-xl font-bold mb-4">Related Guides</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link to="/docs/embedding">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          Embedding Forms
                          <ArrowRight className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                          Learn how to embed forms with parameter tracking
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                  <Link to="/docs/integrations">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          Integrations
                          <ArrowRight className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                          Send parameter data to other tools via integrations
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

export default UrlParametersGuide;
