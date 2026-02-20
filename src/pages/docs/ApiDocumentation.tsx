import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";

const ApiDocumentation = () => {
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
                  { label: "API Documentation", href: "/docs/api" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4">FormsEdge API Documentation</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Programmatic access to your form responses with RESTful APIs and webhooks.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Authentication</h2>
                <p className="mb-4">
                  All API requests require authentication using JWT tokens. Include your token in the Authorization header:
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`Authorization: Bearer YOUR_JWT_TOKEN`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Getting Your Token</h3>
                <p className="mb-4">
                  Your API token is your Supabase JWT from your current session. To obtain it:
                </p>
                <ol className="list-decimal list-inside space-y-2 mb-6">
                  <li>Log in to FormsEdge</li>
                  <li>Open browser developer console (F12)</li>
                  <li>In the console, run: <code className="bg-muted px-2 py-1 rounded text-sm">localStorage.getItem('sb-upzbauplibbnmmsvlsjf-auth-token')</code></li>
                  <li>Copy the access_token value from the JSON response</li>
                </ol>
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                  <p className="text-sm">
                    <strong>Note:</strong> Session tokens expire after 1 hour by default. For production use, implement proper token refresh logic. Keep your API token secure and never expose it in client-side code or public repositories.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Responses API</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">List Responses</h3>
                <p className="mb-4">
                  Retrieve all responses for a specific form with pagination and filtering.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <pre className="text-sm font-mono overflow-x-auto">
{`GET /form-responses?form_id={form_id}`}
                  </pre>
                </div>

                <h4 className="font-bold mt-6 mb-3">Query Parameters</h4>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4">Parameter</th>
                        <th className="text-left py-2 pr-4">Type</th>
                        <th className="text-left py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">form_id</td>
                        <td className="py-2 pr-4">string</td>
                        <td className="py-2">Required. The form ID</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">status</td>
                        <td className="py-2 pr-4">string</td>
                        <td className="py-2">complete | partial | all (default: complete)</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">page_size</td>
                        <td className="py-2 pr-4">number</td>
                        <td className="py-2">1-200 (default: 50)</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">cursor</td>
                        <td className="py-2 pr-4">string</td>
                        <td className="py-2">Pagination cursor from previous response</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">since</td>
                        <td className="py-2 pr-4">string</td>
                        <td className="py-2">ISO 8601 timestamp (filter responses after)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono">until</td>
                        <td className="py-2 pr-4">string</td>
                        <td className="py-2">ISO 8601 timestamp (filter responses before)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-bold mt-6 mb-3">Example Request</h4>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <pre className="text-sm font-mono overflow-x-auto">
{`curl -X GET 'https://upzbauplibbnmmsvlsjf.supabase.co/functions/v1/form-responses?form_id=abc123&status=complete&page_size=50' \\
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'`}
                  </pre>
                </div>

                <h4 className="font-bold mt-6 mb-3">Example Response</h4>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`{
  "items": [
    {
      "id": "resp_123",
      "form_id": "abc123",
      "form_title": "Contact Form",
      "status": "complete",
      "respondent_id": "user_456",
      "respondent_email": "john@example.com",
      "created_at": "2024-11-21T10:30:00Z",
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
  ],
  "total_count": 142,
  "page_size": 50,
  "next_cursor": "eyJzdWJtaXR0ZWRfYXQiOiIyMDI0LTExLTIxVDEwOjMyOjE1WiIsImlkIjoicmVzcF8xMjMifQ==",
  "has_more": true
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Get Single Response</h3>
                <p className="mb-4">
                  Retrieve a specific response by ID.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <pre className="text-sm font-mono overflow-x-auto">
{`GET /form-responses/{response_id}`}
                  </pre>
                </div>

                <h4 className="font-bold mt-6 mb-3">Example Request</h4>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <pre className="text-sm font-mono overflow-x-auto">
{`curl -X GET 'https://upzbauplibbnmmsvlsjf.supabase.co/functions/v1/form-responses/resp_123' \\
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'`}
                  </pre>
                </div>

                <h4 className="font-bold mt-6 mb-3">Example Response</h4>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`{
  "item": {
    "id": "resp_123",
    "form_id": "abc123",
    "form_title": "Contact Form",
    "status": "complete",
    "respondent_email": "john@example.com",
    "submitted_at": "2024-11-21T10:32:15Z",
    "answers": [...]
  }
}`}
                  </pre>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Webhooks</h2>
                <p className="mb-4">
                  Webhooks automatically send form submission data to your server in real-time.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Webhook Payload</h3>
                <p className="mb-4">
                  When a form is submitted, FormsEdge sends a POST request to your webhook URL:
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
      "utm_source": "google"
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
      }
    ]
  }
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Webhook Security</h3>
                <p className="mb-4">
                  FormsEdge signs webhook payloads using HMAC-SHA256 to verify authenticity.
                </p>

                <h4 className="font-bold mt-6 mb-3">Signature Header</h4>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <pre className="text-sm font-mono overflow-x-auto">
{`X-FormsEdge-Signature: sha256=abc123def456...`}
                  </pre>
                </div>

                <h4 className="font-bold mt-6 mb-3">Verifying Signatures (Node.js)</h4>
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

// In your webhook endpoint:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-formsedge-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifySignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  console.log('Valid webhook received:', req.body);
  res.status(200).send('OK');
});`}
                  </pre>
                </div>

                <h4 className="font-bold mt-6 mb-3">Verifying Signatures (Python)</h4>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`import hmac
import hashlib

def verify_signature(payload: str, signature: str, secret: str) -> bool:
    expected_signature = 'sha256=' + hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# In your webhook endpoint:
@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-FormsEdge-Signature')
    payload = request.get_data(as_text=True)
    secret = os.environ.get('WEBHOOK_SECRET')
    
    if not verify_signature(payload, signature, secret):
        return 'Invalid signature', 401
    
    # Process the webhook
    data = request.json
    print(f"Valid webhook received: {data}")
    return 'OK', 200`}
                  </pre>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Error Codes</h2>
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4">Code</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">unauthorized</td>
                        <td className="py-2 pr-4">401</td>
                        <td className="py-2">Missing or invalid authentication</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">forbidden</td>
                        <td className="py-2 pr-4">403</td>
                        <td className="py-2">Access denied to the resource</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">not_found</td>
                        <td className="py-2 pr-4">404</td>
                        <td className="py-2">Resource not found</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 pr-4 font-mono">bad_request</td>
                        <td className="py-2 pr-4">400</td>
                        <td className="py-2">Invalid request parameters</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono">internal_error</td>
                        <td className="py-2 pr-4">500</td>
                        <td className="py-2">Server error</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Rate Limits</h2>
                <ul className="space-y-2 mb-8">
                  <li>API requests: 100 per minute per user</li>
                  <li>Webhook deliveries: 1000 per hour per form</li>
                  <li>Retry limit: 5 attempts with exponential backoff</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Best Practices</h2>
                <ul className="space-y-2 mb-8">
                  <li>Always verify webhook signatures to ensure authenticity</li>
                  <li>Use HTTPS URLs for webhook endpoints</li>
                  <li>Implement idempotency using the event_id to handle duplicates</li>
                  <li>Respond to webhooks quickly (within 5 seconds) to avoid timeouts</li>
                  <li>Store API tokens securely and never commit them to version control</li>
                  <li>Use pagination cursors for large response datasets</li>
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

export default ApiDocumentation;
