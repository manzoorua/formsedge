import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";

const IntegrationsGuide = () => {
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
                  { label: "Integrations", href: "/docs/integrations" },
                  { label: "Setup Guide", href: "/docs/integrations" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4">Integrations Setup Guide</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Connect FormsEdge with your favorite tools to automate workflows and sync data seamlessly.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Available Integrations</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Webhooks</h3>
                    <p className="text-sm text-muted-foreground">
                      Send response data to any API endpoint
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Zapier</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with 5,000+ apps via Zapier
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Google Sheets</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically add responses to spreadsheets
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Slack</h3>
                    <p className="text-sm text-muted-foreground">
                      Get notifications in your Slack channels
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Webhooks</h2>
                <p className="mb-4">
                  Webhooks are the most flexible integration method. They send form data to any URL you specify.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Setting Up a Webhook</h3>
                <ol className="space-y-3 mb-6">
                  <li>Go to your form's Integrations page</li>
                  <li>Click "Add Integration" and select "Webhook"</li>
                  <li>Enter your webhook URL</li>
                  <li>Choose trigger event (usually "Form Submitted")</li>
                  <li>Optionally add custom headers for authentication</li>
                  <li>Save and enable the integration</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Webhook Payload</h3>
                <p className="mb-4">
                  FormsEdge sends a POST request with this standardized JSON structure:
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`{
  "event_id": "evt_789",
  "event_type": "form_response",
  "created_at": "2024-11-21T10:32:15Z",
  "form_response": {
    "id": "resp_123",
    "form_id": "abc123",
    "form_title": "Contact Form",
    "status": "complete",
    "respondent_email": "john@example.com",
    "submitted_at": "2024-11-21T10:32:15Z",
    "url_params": {
      "utm_source": "google",
      "utm_campaign": "spring2024"
    },
    "metadata": {
      "completion_time_seconds": 135,
      "completion_time_label": "2 minutes"
    },
    "answers": [
      {
        "field": {
          "id": "field_1",
          "label": "Full Name",
          "type": "text"
        },
        "type": "text",
        "value": "John Doe"
      },
      {
        "field": {
          "id": "field_2",
          "label": "Email Address",
          "type": "email"
        },
        "type": "email",
        "value": "john@example.com"
      }
    ]
  }
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Webhook Security</h3>
                <p className="mb-4">
                  FormsEdge signs all webhook payloads using HMAC-SHA256 to verify authenticity. Always verify signatures to ensure requests are from FormsEdge.
                </p>

                <h4 className="font-bold mt-6 mb-3">Setting Up Webhook Security</h4>
                <ol className="space-y-2 mb-6">
                  <li>In your webhook integration settings, generate a secret key</li>
                  <li>Store this secret securely on your server</li>
                  <li>Use it to verify the X-FormsEdge-Signature header</li>
                </ol>

                <h4 className="font-bold mt-6 mb-3">Signature Verification (Node.js)</h4>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <pre className="text-sm font-mono overflow-x-auto">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-formsedge-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook safely
  res.status(200).send('OK');
});`}
                  </pre>
                </div>

                <h4 className="font-bold mt-6 mb-3">Signature Verification (Python)</h4>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`import hmac
import hashlib

def verify_signature(payload: str, signature: str, secret: str) -> bool:
    expected = 'sha256=' + hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-FormsEdge-Signature')
    payload = request.get_data(as_text=True)
    
    if not verify_signature(payload, signature, os.environ['WEBHOOK_SECRET']):
        return 'Invalid signature', 401
    
    # Process the webhook safely
    return 'OK', 200`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Testing Webhooks</h3>
                <p className="mb-6">
                  Use services like webhook.site or requestbin.com to test:
                </p>
                <ol className="space-y-2 mb-8">
                  <li>Get a test webhook URL from the service</li>
                  <li>Configure it in FormsEdge</li>
                  <li>Submit a test form response</li>
                  <li>Verify the payload is received correctly</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Zapier Integration</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Connecting to Zapier</h3>
                <ol className="space-y-3 mb-6">
                  <li>Log in to your Zapier account</li>
                  <li>Create a new Zap</li>
                  <li>Search for "FormsEdge" as the trigger app</li>
                  <li>Choose "New Form Response" as the trigger</li>
                  <li>Connect your FormsEdge account</li>
                  <li>Select the form to monitor</li>
                  <li>Test the trigger</li>
                  <li>Add your action steps (send email, add to CRM, etc.)</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Popular Zap Templates</h3>
                <div className="space-y-4 mb-8">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Add to Google Sheets</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically append new responses to a spreadsheet
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Send Email via Gmail</h4>
                    <p className="text-sm text-muted-foreground">
                      Forward responses to team members via email
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Create Trello Card</h4>
                    <p className="text-sm text-muted-foreground">
                      Add new leads as cards in your Trello board
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Add to HubSpot CRM</h4>
                    <p className="text-sm text-muted-foreground">
                      Create or update contacts in HubSpot
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Email Notifications</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Simple Email Alerts</h3>
                <p className="mb-4">
                  Get notified via email for every new response:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Go to Form Settings → General</li>
                  <li>Enter notification email address</li>
                  <li>Choose frequency (instant, daily, weekly)</li>
                  <li>Save settings</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Custom Email Integration</h3>
                <p className="mb-6">
                  For advanced email workflows, use:
                </p>
                <ul className="space-y-2 mb-8">
                  <li>Webhooks to your email service API</li>
                  <li>Zapier with Gmail or Outlook actions</li>
                  <li>n8n workflows for complex routing</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Integration Best Practices</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Error Handling</h3>
                <ul className="space-y-2 mb-6">
                  <li>Monitor integration logs in the Integrations tab</li>
                  <li>Set up error notifications</li>
                  <li>Have a backup webhook URL for critical integrations</li>
                  <li>Test integrations thoroughly before going live</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Security</h3>
                <ul className="space-y-2 mb-6">
                  <li>Use HTTPS URLs for webhooks</li>
                  <li>Add authentication headers when possible</li>
                  <li>Validate webhook signatures on the receiving end</li>
                  <li>Don't expose sensitive data in webhook URLs</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Performance</h3>
                <ul className="space-y-2 mb-8">
                  <li>Ensure webhook endpoints respond quickly (&lt;5 seconds)</li>
                  <li>Use async processing for long-running tasks</li>
                  <li>Implement retry logic on the receiving end</li>
                  <li>Monitor integration performance regularly</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Troubleshooting</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Integration Not Triggering</h3>
                <ul className="space-y-2 mb-6">
                  <li>✓ Verify integration is enabled</li>
                  <li>✓ Check webhook URL is correct and accessible</li>
                  <li>✓ Review integration logs for errors</li>
                  <li>✓ Test with a simple webhook URL first</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Data Not Matching</h3>
                <ul className="space-y-2 mb-6">
                  <li>✓ Check field mapping in your integration</li>
                  <li>✓ Verify data format expectations</li>
                  <li>✓ Look at the actual payload in integration logs</li>
                  <li>✓ Ensure receiving system can handle the data type</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Authentication Failures</h3>
                <ul className="space-y-2 mb-8">
                  <li>✓ Verify API keys and tokens are current</li>
                  <li>✓ Check authentication headers are properly set</li>
                  <li>✓ Ensure OAuth connections are still valid</li>
                  <li>✓ Re-authorize the integration if needed</li>
                </ul>
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

export default IntegrationsGuide;
