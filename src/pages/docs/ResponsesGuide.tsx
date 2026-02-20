import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";

const ResponsesGuide = () => {
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
                  { label: "Responses", href: "/docs/responses" },
                  { label: "Managing Responses", href: "/docs/responses" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4">Managing Form Responses</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Learn how to view, analyze, export, and manage all responses to your forms.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Viewing Responses</h2>
                <p className="mb-4">
                  Access your form responses from multiple places:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>Dashboard: See recent responses across all forms</li>
                  <li>Form Builder: Click "Responses" tab while editing a form</li>
                  <li>Form Menu: Click the three dots next to any form and select "View Responses"</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Response Table</h3>
                <p className="mb-4">
                  The response table shows:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Submission Time:</strong> When the form was submitted</li>
                  <li><strong>Status:</strong> Complete or partial submission</li>
                  <li><strong>Preview:</strong> Quick view of first few answers</li>
                  <li><strong>Actions:</strong> View details, export, or delete</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Response Details</h3>
                <p className="mb-6">
                  Click any response to see:
                </p>
                <ul className="space-y-2 mb-8">
                  <li>All field responses with labels</li>
                  <li>File uploads with download links</li>
                  <li>URL parameters (if configured)</li>
                  <li>Submission metadata (timestamp, IP address if enabled)</li>
                  <li>Respondent email (if collected)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Exporting Responses</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Export Formats</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-bold">CSV (Comma-Separated Values)</h4>
                    <p className="text-sm text-muted-foreground">Compatible with Excel, Google Sheets, and most tools</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Excel (.xlsx)</h4>
                    <p className="text-sm text-muted-foreground">Native Excel format with formatting</p>
                  </div>
                  <div>
                    <h4 className="font-bold">PDF</h4>
                    <p className="text-sm text-muted-foreground">Individual response reports (coming soon)</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Export Options</h3>
                <p className="mb-4">
                  Customize your export:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Include Partial Responses:</strong> Export incomplete submissions</li>
                  <li><strong>Include Metadata:</strong> Add submission time, IP, user agent</li>
                  <li><strong>Include URL Parameters:</strong> Export tracking data (if configured)</li>
                  <li><strong>Date Range:</strong> Export specific time periods (coming soon)</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">How to Export</h3>
                <ol className="space-y-2 mb-8">
                  <li>Go to your form's Responses tab</li>
                  <li>Click the "Export" button</li>
                  <li>Select format (CSV or Excel)</li>
                  <li>Choose export options</li>
                  <li>Click "Export" to download</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Analytics</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Form Analytics</h3>
                <p className="mb-4">
                  Access the Analytics tab to see:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Views:</strong> How many times your form was loaded</li>
                  <li><strong>Starts:</strong> Users who interacted with the form</li>
                  <li><strong>Completions:</strong> Successful submissions</li>
                  <li><strong>Completion Rate:</strong> Percentage of starts that completed</li>
                  <li><strong>Drop-off Rate:</strong> Where users abandon the form</li>
                  <li><strong>Average Completion Time:</strong> How long it takes to fill out</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Field-Level Analytics</h3>
                <p className="mb-6">
                  See performance for each field:
                </p>
                <ul className="space-y-2 mb-8">
                  <li>Field interaction rate</li>
                  <li>Average time spent on field</li>
                  <li>Drop-off at specific fields</li>
                  <li>Most common answers (for choice fields)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Managing Responses</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Deleting Responses</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Warning:</strong> Deleted responses cannot be recovered. Consider exporting before deletion.
                  </p>
                </div>

                <p className="mb-6">
                  To delete a response:
                </p>
                <ol className="space-y-2 mb-8">
                  <li>Click the three dots menu on the response row</li>
                  <li>Select "Delete Response"</li>
                  <li>Confirm deletion</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Bulk Actions</h3>
                <p className="mb-6">
                  Select multiple responses to:
                </p>
                <ul className="space-y-2 mb-8">
                  <li>Export selected responses</li>
                  <li>Delete multiple responses at once</li>
                  <li>Mark as reviewed (coming soon)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Partial Submissions</h2>
                <p className="mb-4">
                  Partial submissions are saved when:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>User starts filling form but doesn't submit</li>
                  <li>Browser is closed before completion</li>
                  <li>Session expires</li>
                </ul>

                <p className="mb-6">
                  Enable partial submission tracking in Form Settings → General to capture this data.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Email Notifications</h2>
                <p className="mb-4">
                  Get notified of new responses:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Go to Form Settings → General</li>
                  <li>Enter notification email address</li>
                  <li>Choose notification frequency:
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>Instant (per submission)</li>
                      <li>Daily digest</li>
                      <li>Weekly summary</li>
                    </ul>
                  </li>
                  <li>Save settings</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Response Limits</h2>
                <p className="mb-4">
                  Control how many responses you accept:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Go to Form Settings → General</li>
                  <li>Enable "Limit Responses"</li>
                  <li>Set maximum number of responses</li>
                  <li>Customize message shown when limit is reached</li>
                </ol>

                <p className="mb-8">
                  Once the limit is reached, the form automatically stops accepting new submissions.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Best Practices</h2>
                <ul className="space-y-3 mb-8">
                  <li><strong>Regular exports:</strong> Back up your data by exporting regularly</li>
                  <li><strong>Review quickly:</strong> Check responses promptly for time-sensitive forms</li>
                  <li><strong>Monitor analytics:</strong> Track completion rates to optimize your forms</li>
                  <li><strong>Clean up test data:</strong> Delete test submissions before going live</li>
                  <li><strong>Set up notifications:</strong> Stay informed of important submissions</li>
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

export default ResponsesGuide;
