import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FormBuilderGuide = () => {
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
                  { label: "Form Builder Guide", href: "/docs/form-builder" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4">Form Builder Interface Guide</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Master the FormsEdge form builder with this comprehensive guide to the interface 
                  and all available features.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Interface Overview</h2>
                <p className="mb-6">
                  The Form Builder consists of four main areas:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">1. Top Toolbar</h3>
                    <p className="text-sm text-muted-foreground">
                      Save status, preview, settings, and publish controls
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">2. Field Palette (Left)</h3>
                    <p className="text-sm text-muted-foreground">
                      All available field types to drag onto your form
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">3. Canvas (Center)</h3>
                    <p className="text-sm text-muted-foreground">
                      Where you build and arrange your form
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-bold mb-2">4. Settings Panel (Right)</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure selected fields and form settings
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Top Toolbar</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Auto-Save Indicator</h3>
                <p className="mb-4">
                  The toolbar shows your save status:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Saved:</strong> All changes are saved to the cloud</li>
                  <li><strong>Saving...</strong> Changes are being synchronized</li>
                  <li><strong>Unsaved Changes:</strong> Some changes haven't been saved yet</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Preview Button</h3>
                <p className="mb-4">
                  Click to see how your form looks to respondents. Test functionality and responsive design.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Settings Button</h3>
                <p className="mb-4">
                  Access global form settings including:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>Form title and description</li>
                  <li>Branding (colors, logo)</li>
                  <li>Thank you message</li>
                  <li>Email notifications</li>
                  <li>Response limits</li>
                  <li>URL parameters</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Publish Button</h3>
                <p className="mb-6">
                  Publish your form to make it live. Once published, you can share the link or embed it.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Field Types</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Input Fields</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-bold">Text</h4>
                    <p className="text-sm text-muted-foreground">Single-line text input for names, titles, etc.</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Email</h4>
                    <p className="text-sm text-muted-foreground">Email input with built-in validation</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Phone</h4>
                    <p className="text-sm text-muted-foreground">Phone number with optional formatting</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Number</h4>
                    <p className="text-sm text-muted-foreground">Numeric input with min/max validation</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Textarea</h4>
                    <p className="text-sm text-muted-foreground">Multi-line text for longer responses</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Choice Fields</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-bold">Radio Buttons</h4>
                    <p className="text-sm text-muted-foreground">Single selection from multiple options</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Checkboxes</h4>
                    <p className="text-sm text-muted-foreground">Multiple selections allowed</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Dropdown/Select</h4>
                    <p className="text-sm text-muted-foreground">Space-saving dropdown menu</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Multi-Select</h4>
                    <p className="text-sm text-muted-foreground">Dropdown with multiple selections</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Advanced Fields</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-bold">File Upload</h4>
                    <p className="text-sm text-muted-foreground">Allow users to upload files (images, PDFs, etc.)</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Date Picker</h4>
                    <p className="text-sm text-muted-foreground">Calendar-based date selection</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Time Picker</h4>
                    <p className="text-sm text-muted-foreground">Time selection with AM/PM</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Rating</h4>
                    <p className="text-sm text-muted-foreground">Star or number-based ratings</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Slider</h4>
                    <p className="text-sm text-muted-foreground">Visual slider for numeric values</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Signature</h4>
                    <p className="text-sm text-muted-foreground">Digital signature capture</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Matrix</h4>
                    <p className="text-sm text-muted-foreground">Grid of questions with same answer options</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Content Fields</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-bold">Section/Heading</h4>
                    <p className="text-sm text-muted-foreground">Organize forms with section headers</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Divider</h4>
                    <p className="text-sm text-muted-foreground">Visual separator between sections</p>
                  </div>
                  <div>
                    <h4 className="font-bold">HTML</h4>
                    <p className="text-sm text-muted-foreground">Custom HTML content for rich formatting</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Page Break</h4>
                    <p className="text-sm text-muted-foreground">Split forms into multiple pages</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Field Configuration</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">General Settings</h3>
                <p className="mb-4">
                  Every field has these basic settings:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Label:</strong> The question or prompt displayed to users</li>
                  <li><strong>Description:</strong> Optional help text under the label</li>
                  <li><strong>Placeholder:</strong> Example text shown in input fields</li>
                  <li><strong>Required:</strong> Make the field mandatory</li>
                  <li><strong>Width:</strong> Control field width (25%, 50%, 75%, 100%)</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Validation Rules</h3>
                <p className="mb-4">
                  Add validation to ensure data quality:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Min/Max Length:</strong> Character limits for text fields</li>
                  <li><strong>Min/Max Value:</strong> Numeric ranges</li>
                  <li><strong>Pattern Matching:</strong> Regular expressions for custom validation</li>
                  <li><strong>File Size Limits:</strong> Maximum upload size</li>
                  <li><strong>Allowed File Types:</strong> Restrict upload formats</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Conditional Logic</h3>
                <p className="mb-4">
                  Show or hide fields based on other answers:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Select a field to add logic to</li>
                  <li>Click "Add Logic" in the Logic tab</li>
                  <li>Choose the condition (show/hide when...)</li>
                  <li>Select the trigger field and value</li>
                </ol>

                <div className="bg-muted/50 rounded-lg p-4 mb-8">
                  <p className="text-sm"><strong>Example:</strong> Show "Company Name" field only when user selects "Business" as customer type.</p>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Calculations</h3>
                <p className="mb-6">
                  Perform math operations on numeric fields to calculate totals, prices, scores, etc.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Canvas Operations</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Adding Fields</h3>
                <ul className="space-y-2 mb-6">
                  <li>Drag a field from the palette to the canvas</li>
                  <li>Drop it between existing fields to insert</li>
                  <li>Drop at the end to append</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Reordering Fields</h3>
                <ul className="space-y-2 mb-6">
                  <li>Click and hold the drag handle (⋮⋮) on any field</li>
                  <li>Drag to a new position</li>
                  <li>Release to drop</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Duplicating Fields</h3>
                <ul className="space-y-2 mb-6">
                  <li>Click the duplicate icon on the field toolbar</li>
                  <li>Creates an exact copy below the original</li>
                  <li>Useful for repetitive fields</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Deleting Fields</h3>
                <ul className="space-y-2 mb-6">
                  <li>Click the delete icon on the field toolbar</li>
                  <li>Confirm deletion</li>
                  <li>Field and its data are removed</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Keyboard Shortcuts</h2>
                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-mono text-sm mb-1"><kbd className="px-2 py-1 bg-background border rounded">Ctrl/Cmd + S</kbd></p>
                      <p className="text-sm text-muted-foreground">Save form</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm mb-1"><kbd className="px-2 py-1 bg-background border rounded">Ctrl/Cmd + P</kbd></p>
                      <p className="text-sm text-muted-foreground">Preview form</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm mb-1"><kbd className="px-2 py-1 bg-background border rounded">Delete</kbd></p>
                      <p className="text-sm text-muted-foreground">Delete selected field</p>
                    </div>
                    <div>
                      <p className="font-mono text-sm mb-1"><kbd className="px-2 py-1 bg-background border rounded">Ctrl/Cmd + D</kbd></p>
                      <p className="text-sm text-muted-foreground">Duplicate field</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Best Practices</h2>
                <ul className="space-y-3 mb-8">
                  <li><strong>Keep it simple:</strong> Only ask for information you truly need</li>
                  <li><strong>Logical order:</strong> Arrange fields in a natural flow</li>
                  <li><strong>Clear labels:</strong> Use simple, descriptive field labels</li>
                  <li><strong>Help text:</strong> Add descriptions for complex fields</li>
                  <li><strong>Mobile-first:</strong> Test on mobile devices regularly</li>
                  <li><strong>Save often:</strong> Auto-save is enabled but manual saves are instant</li>
                </ul>
              </article>

              <DocsFeedback />

              <div className="mt-12 border-t border-border pt-8">
                <h3 className="text-xl font-bold mb-4">Related Guides</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link to="/docs/url-parameters">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          URL Parameters
                          <ArrowRight className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                          Capture context data from URL parameters and hidden fields
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
                          Learn how to embed your forms on websites
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

export default FormBuilderGuide;
