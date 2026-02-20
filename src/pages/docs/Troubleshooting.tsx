import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { AlertCircle } from "lucide-react";

const Troubleshooting = () => {
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
                  { label: "Help", href: "/docs/troubleshooting" },
                  { label: "Troubleshooting", href: "/docs/troubleshooting" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4 flex items-center">
                  <AlertCircle className="w-10 h-10 mr-4 text-primary" />
                  Troubleshooting Guide
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Quick solutions to common issues. Can't find your problem? Contact support.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Form Issues</h2>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Form Not Loading</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Form appears blank or shows loading spinner indefinitely</p>
                  <p className="mb-3"><strong>Common Causes:</strong></p>
                  <ul className="space-y-1 mb-3">
                    <li>Form is in draft status</li>
                    <li>Form ID is incorrect</li>
                    <li>Network connectivity issues</li>
                    <li>Browser cache issues</li>
                  </ul>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Verify form status is "Published" in dashboard</li>
                    <li>Double-check form ID in embed code</li>
                    <li>Clear browser cache and hard reload (Ctrl+Shift+R)</li>
                    <li>Test in incognito/private window</li>
                    <li>Check browser console for error messages</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Form Styling Looks Broken</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Form has layout issues, colors don't match, elements overlap</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Check for CSS conflicts with your site's styles</li>
                    <li>Verify theme setting matches your page (light/dark)</li>
                    <li>Test form in isolation (new HTML page)</li>
                    <li>Review custom CSS in form settings for errors</li>
                    <li>Disable browser extensions that may affect styling</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Can't Save Form Changes</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Changes aren't saving, "Saving..." indicator doesn't complete</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Check internet connection</li>
                    <li>Try manual save (Ctrl/Cmd + S)</li>
                    <li>Refresh page and try again</li>
                    <li>Check if another user/tab has the form locked</li>
                    <li>Copy your changes as backup, then refresh</li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Response Issues</h2>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Responses Not Saving</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Users report form submissions don't go through</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Verify form status is "Published"</li>
                    <li>Check if response limit has been reached</li>
                    <li>Ensure "Accept Responses" is enabled in settings</li>
                    <li>Check for validation errors on required fields</li>
                    <li>Test submission yourself to reproduce issue</li>
                    <li>Review browser console for JavaScript errors</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Missing Response Data</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Responses show up but some fields are empty</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Check if fields have conditional logic that hides them</li>
                    <li>Verify fields aren't optional (if data is expected)</li>
                    <li>Look for validation errors users might encounter</li>
                    <li>Check partial submissions (incomplete responses)</li>
                    <li>Review field configuration for data type issues</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Can't Export Responses</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Export button doesn't work or file is empty</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Ensure there are responses to export</li>
                    <li>Check browser pop-up blocker settings</li>
                    <li>Try different export format (CSV vs Excel)</li>
                    <li>Disable browser extensions temporarily</li>
                    <li>Try exporting in incognito mode</li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Embed Issues</h2>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Embed Not Showing on Website</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Form doesn't appear where embedded</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Verify form is published (not draft)</li>
                    <li>Check embed code is placed correctly in HTML</li>
                    <li>Ensure script tag is present and loading</li>
                    <li>Look for JavaScript errors in browser console</li>
                    <li>Test with basic HTML page to isolate issue</li>
                    <li>Check if your CMS/platform blocks external scripts</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Iframe Not Resizing</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Form is cut off or has unnecessary scrollbars</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Use script-based embed instead (supports auto-resize)</li>
                    <li>For iframes, set appropriate width/height</li>
                    <li>Add <code>height="auto"</code> for responsive height</li>
                    <li>Test form height and adjust iframe accordingly</li>
                    <li>Consider using popup or slider mode instead of inline</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Platform-Specific Embedding Not Working</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Following platform instructions but form still not appearing</p>
                  <p className="mb-3"><strong>Common causes:</strong></p>
                  <ul className="space-y-2 mb-4">
                    <li>WordPress: Using wrong editor mode (Gutenberg vs Classic)</li>
                    <li>Squarespace: Free plan restrictions on custom code</li>
                    <li>Webflow: Embed component not set to "Display: Block"</li>
                    <li>Shopify: Editing wrong template file</li>
                    <li>Wix: Using wrong embed type (use HTML iframe)</li>
                    <li>All platforms: Not saving/publishing changes after pasting code</li>
                  </ul>
                  <p className="mb-3"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Double-check you're following the correct platform instructions</li>
                    <li>Verify your platform/plan supports custom code embedding</li>
                    <li>Ensure you've saved and published changes after pasting</li>
                    <li>Try the Generic HTML instructions if platform-specific fails</li>
                    <li>Test with a simple HTML file first to verify embed code works</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Mobile Display Issues</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Form looks broken on mobile devices</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Test form preview on mobile before embedding</li>
                    <li>Ensure iframe/container has responsive width (100%)</li>
                    <li>Check field widths aren't forcing horizontal scroll</li>
                    <li>Verify fonts are readable on small screens</li>
                    <li>Test on actual devices, not just browser emulation</li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Integration Issues</h2>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Webhook Not Firing</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> No data received at webhook endpoint</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Verify integration is enabled</li>
                    <li>Check webhook URL is correct and accessible</li>
                    <li>Review integration logs in FormsEdge</li>
                    <li>Test webhook URL with curl or Postman</li>
                    <li>Ensure endpoint responds within timeout (5s)</li>
                    <li>Check if firewall blocks FormsEdge requests</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Data Not Matching in Integration</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Data arrives but fields are wrong or empty</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Check field mapping configuration</li>
                    <li>Review actual payload in integration logs</li>
                    <li>Verify data format expectations match</li>
                    <li>Look for field ID vs label confusion</li>
                    <li>Test with simple form to isolate issue</li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Performance Issues</h2>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Slow Form Loading</h3>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Reduce number of fields if possible</li>
                    <li>Optimize image uploads (compress, resize)</li>
                    <li>Use pagination for long forms</li>
                    <li>Check your internet connection speed</li>
                    <li>Clear browser cache</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Dashboard Loading Slowly</h3>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Archive old forms you no longer use</li>
                    <li>Clear browser cache and cookies</li>
                    <li>Check internet connection</li>
                    <li>Try different browser</li>
                    <li>Disable browser extensions temporarily</li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Team & Collaboration Issues</h2>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Team Invitation Not Received</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Invited team member says they didn't receive the invitation email</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Check spam/junk folder in email</li>
                    <li>Verify email address was entered correctly</li>
                    <li>Ask the inviter to resend the invitation</li>
                    <li>Check if email provider blocks automated emails</li>
                    <li>Try using a different email address</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Can't Accept Team Invitation</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Clicking invitation link shows error or doesn't work</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Invitation links expire after 7 days - request a new one</li>
                    <li>You must use the same email address the invitation was sent to</li>
                    <li>If you have an account, make sure you're logged in with the correct email</li>
                    <li>Try copying and pasting the full link if clicking doesn't work</li>
                    <li>Clear browser cache and try again</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Team Member Limit Reached</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Can't invite new team members, error shows limit reached</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Member limits include pending invitations - cancel unused invitations</li>
                    <li>Remove inactive team members to free up slots</li>
                    <li>Pro plan: 3 members, Enterprise: 10 members</li>
                    <li>Free plan cannot invite team members - upgrade required</li>
                    <li>Consider upgrading to a higher tier for more members</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Team Member Can't Access Form</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Invited team member can't see or edit the form</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Verify invitation was accepted (check team member list)</li>
                    <li>Check the role assigned - Viewers can't edit, only view</li>
                    <li>Ask team member to log out and log back in</li>
                    <li>Verify they're using the email address that was invited</li>
                    <li>Check if form ownership was transferred unexpectedly</li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Account & Billing Issues</h2>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Can't Access Premium Features</h3>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Verify your subscription status in Billing</li>
                    <li>Check if payment went through</li>
                    <li>Log out and log back in</li>
                    <li>Contact support if subscription shows active</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Payment Failed</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Subscription not active, payment error messages</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Update payment method in Billing → Manage Subscription</li>
                    <li>Check if card has sufficient funds</li>
                    <li>Verify card hasn't expired</li>
                    <li>Contact your bank if payments are being blocked</li>
                    <li>Try a different payment method</li>
                    <li>Contact support if issues persist</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-3">Subscription Not Reflecting After Upgrade</h3>
                  <p className="mb-3"><strong>Symptoms:</strong> Upgraded but still seeing old plan limits</p>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Refresh the page (Ctrl/Cmd + Shift + R)</li>
                    <li>Log out and log back in</li>
                    <li>Wait a few minutes for payment to process</li>
                    <li>Check Billing page to confirm subscription is active</li>
                    <li>Check email for payment confirmation</li>
                    <li>Contact support with payment receipt if needed</li>
                  </ol>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold mb-3">Form Limit Reached</h3>
                  <p className="mb-2"><strong>Solutions:</strong></p>
                  <ol className="space-y-2">
                    <li>Archive forms you no longer need</li>
                    <li>Delete draft forms not in use</li>
                    <li>Upgrade to higher plan tier</li>
                    <li>Review your form organization</li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Still Need Help?</h2>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                  <p className="mb-4">
                    If you couldn't find a solution to your problem:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li>📧 Email: support@formsedge.com</li>
                    <li>💬 Live Chat: Available in dashboard (bottom right)</li>
                    <li>📚 Browse more docs: <a href="/docs" className="text-primary hover:underline">Documentation</a></li>
                    <li>🎥 Video tutorials: Coming soon</li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    When contacting support, please include:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Form ID or link</li>
                    <li>• Description of the issue</li>
                    <li>• Steps to reproduce</li>
                    <li>• Screenshots if applicable</li>
                    <li>• Browser and device information</li>
                  </ul>
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

export default Troubleshooting;
