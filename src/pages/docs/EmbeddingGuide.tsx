import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";

const EmbeddingGuide = () => {
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
                  { label: "Distribution", href: "/docs/embedding" },
                  { label: "Embedding Forms", href: "/docs/embedding" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4">Embedding Forms on Your Website</h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Learn how to embed FormsEdge forms on any website using our script-based or iframe methods.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Getting the Embed Code</h2>
                <ol className="space-y-2 mb-8">
                  <li>Open your form in the Form Builder</li>
                  <li>Click the "Embed" tab</li>
                  <li>Choose your embed type</li>
                  <li>Copy the generated code</li>
                  <li>Paste into your website's HTML</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Embed Methods Comparison</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2">Script-Based (Recommended)</h3>
                    <ul className="text-sm space-y-1 text-green-800">
                      <li>✓ Multiple display modes</li>
                      <li>✓ Auto-resizing</li>
                      <li>✓ Better performance</li>
                      <li>✓ Modern features</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <h3 className="font-bold mb-2">Legacy Iframe</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ Works anywhere</li>
                      <li>✓ No JavaScript required</li>
                      <li>✗ Fixed size</li>
                      <li>✗ Limited features</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Script-Based Embed (Recommended)</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Basic Script Embed</h3>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<div data-fe-form="YOUR_FORM_ID"></div>
<script src="https://yoursite.com/embed.js"></script>`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Inline Mode</h3>
                <p className="mb-4">
                  Embeds the form directly in your page flow. Best for dedicated form pages.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<div 
  data-fe-form="YOUR_FORM_ID"
  data-fe-type="inline"
></div>
<script src="https://yoursite.com/embed.js"></script>`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Popup Mode</h3>
                <p className="mb-4">
                  Opens form in a modal overlay. Great for newsletters and lead capture.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<button data-fe-form="YOUR_FORM_ID" data-fe-type="popup">
  Open Form
</button>
<script src="https://yoursite.com/embed.js"></script>`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Slider Mode</h3>
                <p className="mb-4">
                  A persistent side tab that slides out when clicked. Great for feedback forms and support.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<div 
  data-fe-form="YOUR_FORM_ID"
  data-fe-type="slider"
  data-fe-position="bottom-right"
  data-fe-tab-text="Feedback"
  data-fe-icon="messageSquare"
></div>
<script src="https://yoursite.com/embed.js"></script>`}
                  </pre>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Configuration Options</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Display Options</h3>
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <ul className="space-y-3 text-sm font-mono">
                    <li><code>data-fe-type</code> - Embed type: <code>inline</code>, <code>popup</code>, <code>slider</code></li>
                    <li><code>data-fe-position</code> - Position for popup/slider: <code>bottom-left</code>, <code>bottom-right</code>, <code>top-left</code>, <code>top-right</code>, <code>center</code></li>
                    <li><code>data-fe-theme</code> - Theme: <code>light</code>, <code>dark</code>, <code>auto</code></li>
                    <li><code>data-fe-width</code> - Width for inline embeds: <code>100%</code>, <code>600px</code></li>
                    <li><code>data-fe-height</code> - Height for inline: <code>auto</code>, <code>500px</code></li>
                  </ul>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Icon & Tooltip Options</h3>
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <ul className="space-y-3 text-sm font-mono">
                    <li><code>data-fe-icon</code> - Icon name (Lucide): <code>messageSquare</code>, <code>helpCircle</code>, <code>mail</code>, etc.</li>
                    <li><code>data-fe-icon-url</code> - Custom icon URL: <code>https://example.com/icon.png</code></li>
                    <li><code>data-fe-icon-size</code> - Icon size in pixels: <code>16</code> to <code>32</code> (default: 24)</li>
                    <li><code>data-fe-tooltip</code> - Hover tooltip text (max 50 characters)</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Icons and tooltips work on both popup buttons and slider tabs. Choose from popular Lucide icons or provide your own icon URL.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Slider-Specific Options</h3>
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <ul className="space-y-3 text-sm font-mono">
                    <li><code>data-fe-tab-text</code> - Tab label text (max 15 characters): <code>Feedback</code>, <code>Try me!</code></li>
                    <li><code>data-fe-slide-direction</code> - Slide direction: <code>left</code>, <code>right</code></li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  The slider tab rotates 90 degrees to display vertically on the page edge. Keep tab text short for best appearance.
                </p>

                <h3 className="text-xl font-bold mt-8 mb-4">Advanced Display Options</h3>
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <ul className="space-y-3 text-sm font-mono">
                    <li><code>data-fe-mobile-fullscreen</code> - Fullscreen on mobile: <code>true</code>, <code>false</code></li>
                    <li><code>data-fe-progress</code> - Progress bar position: <code>top</code>, <code>bottom</code>, <code>hidden</code></li>
                    <li><code>data-fe-bg-opacity</code> - Background overlay opacity (0-100): <code>50</code></li>
                    <li><code>data-fe-auto-launch</code> - Auto-open form on page load: <code>true</code></li>
                    <li><code>data-fe-prevent-reopen</code> - Prevent reopening after close: <code>true</code></li>
                    <li><code>data-fe-close-on-submit</code> - Auto-close after submission: <code>true</code></li>
                    <li><code>data-fe-close-delay</code> - Delay before close (ms): <code>2000</code></li>
                  </ul>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Tracking Options</h3>
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <ul className="space-y-3 text-sm font-mono">
                    <li><code>data-fe-hidden</code> - Static hidden parameters: <code>source=homepage,variant=a</code></li>
                    <li><code>data-fe-transitive-params</code> - Capture from URL: <code>utm_source,utm_campaign</code></li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground mb-8">
                  See the <a href="/docs/url-parameters" className="text-primary hover:underline">URL Parameters Guide</a> for detailed tracking setup.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Iframe Auto-Switch Behavior</h2>
                <p className="mb-4">
                  When using the embed code generator, iframe mode automatically switches to script-based code when advanced features are enabled:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>• Non-inline modes (popup or slider)</li>
                  <li>• Custom launch triggers</li>
                  <li>• Prevent reopen or close on submit options</li>
                  <li>• Auto-launch functionality</li>
                  <li>• Custom button styling</li>
                  <li>• Background opacity less than 100%</li>
                  <li>• Progress bar positioning other than top</li>
                  <li>• Mobile fullscreen mode</li>
                </ul>
                <p className="text-sm text-muted-foreground mb-8">
                  This ensures you get the full functionality of advanced features while maintaining simple iframe code for basic use cases.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Platform-Specific Embedding Instructions</h2>
                <p className="mb-4">
                  When you generate your embed code, you can select your platform from a dropdown menu to receive tailored, step-by-step instructions for embedding on:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>WordPress:</strong> Using Custom HTML blocks in Gutenberg or Classic editor</li>
                  <li><strong>Squarespace:</strong> Using Embed blocks in the page editor</li>
                  <li><strong>Webflow:</strong> Using Custom Code embed components in Designer</li>
                  <li><strong>Shopify:</strong> Adding code to theme templates via the code editor</li>
                  <li><strong>Wix:</strong> Using HTML iframe elements in the editor</li>
                  <li><strong>Generic HTML:</strong> Manual placement in any HTML file</li>
                </ul>
                <p className="mb-6">
                  Each platform option provides numbered steps with helpful tips to ensure successful embedding. Simply select your platform and follow the instructions provided alongside your embed code.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Legacy Iframe Embed</h2>
                <p className="mb-4">
                  Use iframe embedding when JavaScript is restricted or unavailable.
                </p>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm font-mono overflow-x-auto">
{`<iframe 
  src="https://yoursite.com/f/YOUR_FORM_ID" 
  width="100%" 
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;">
</iframe>`}
                  </pre>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Iframe embeds don't support auto-resizing or advanced features. Use script-based embeds when possible.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Styling & Customization</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Theme Matching</h3>
                <p className="mb-4">
                  Forms automatically detect and match your site's theme (light/dark mode).
                </p>
                <p className="mb-6">
                  Override with:
                </p>
                <div className="bg-muted rounded-lg p-4 mb-8">
                  <pre className="text-sm font-mono overflow-x-auto">
{`data-fe-theme="light"  <!-- Force light theme -->
data-fe-theme="dark"   <!-- Force dark theme -->
data-fe-theme="auto"   <!-- Auto-detect (default) -->`}
                  </pre>
                </div>

                <h3 className="text-xl font-bold mt-8 mb-4">Custom Styling</h3>
                <p className="mb-4">
                  Customize form appearance in Form Settings:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>Primary and secondary colors</li>
                  <li>Font family</li>
                  <li>Logo and branding</li>
                  <li>Custom CSS (advanced)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Testing Your Embed</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Local Testing</h3>
                <ol className="space-y-2 mb-6">
                  <li>Create a test HTML file with your embed code</li>
                  <li>Open in a browser</li>
                  <li>Test form functionality</li>
                  <li>Check responsive behavior</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Browser Compatibility</h3>
                <p className="mb-6">
                  FormsEdge embeds work in:
                </p>
                <ul className="space-y-1 mb-8">
                  <li>✓ Chrome (latest 2 versions)</li>
                  <li>✓ Firefox (latest 2 versions)</li>
                  <li>✓ Safari (latest 2 versions)</li>
                  <li>✓ Edge (latest 2 versions)</li>
                  <li>✓ Mobile browsers (iOS Safari, Chrome Mobile)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Troubleshooting</h2>

                <h3 className="text-xl font-bold mt-8 mb-4">Form Not Showing</h3>
                <ul className="space-y-2 mb-6">
                  <li>✓ Verify form is published (not draft)</li>
                  <li>✓ Check form ID is correct</li>
                  <li>✓ Ensure embed script is loaded</li>
                  <li>✓ Check browser console for errors</li>
                  <li>✓ Disable browser extensions that may block embeds</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Styling Issues</h3>
                <ul className="space-y-2 mb-6">
                  <li>✓ Check for CSS conflicts on your site</li>
                  <li>✓ Verify theme setting matches your page</li>
                  <li>✓ Test in incognito mode to rule out extensions</li>
                  <li>✓ Check custom CSS in form settings</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Size/Layout Issues</h3>
                <ul className="space-y-2 mb-6">
                  <li>✓ For iframes, adjust width/height attributes</li>
                  <li>✓ For script embeds, use <code>data-fe-width</code> and <code>data-fe-height</code></li>
                  <li>✓ Ensure parent container has sufficient space</li>
                  <li>✓ Test on mobile devices</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Best Practices</h2>
                <ul className="space-y-3 mb-8">
                  <li><strong>Use script embeds:</strong> Better performance and features than iframes</li>
                  <li><strong>Test on mobile:</strong> Ensure forms work well on small screens</li>
                  <li><strong>Monitor performance:</strong> Check form load times and optimize if needed</li>
                  <li><strong>Track sources:</strong> Use URL parameters to know where submissions come from</li>
                  <li><strong>Match branding:</strong> Customize colors and fonts to match your site</li>
                  <li><strong>Choose the right mode:</strong> Inline for dedicated pages, popup for lead capture, slider for feedback</li>
                  <li><strong>Choose the right platform instructions:</strong> Use our platform-specific guides for WordPress, Squarespace, Webflow, Shopify, and Wix</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Quick Reference: Embed Modes</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-bold mb-2">Inline Mode</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Embeds form directly in your page flow. Best for dedicated form pages and landing pages.
                    </p>
                    <code className="text-xs">data-fe-type="inline"</code>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-bold mb-2">Popup Mode</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Opens form in a modal overlay when triggered. Perfect for lead capture and newsletters.
                    </p>
                    <code className="text-xs">data-fe-type="popup"</code>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-bold mb-2">Slider Mode</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Persistent side tab that slides out when clicked. Great for non-intrusive feedback forms.
                    </p>
                    <code className="text-xs">data-fe-type="slider"</code>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Supported Platforms</h2>
                <p className="mb-4">
                  Get tailored embedding instructions for these platforms when you generate your embed code:
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="font-semibold">WordPress</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="font-semibold">Squarespace</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="font-semibold">Webflow</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="font-semibold">Shopify</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="font-semibold">Wix</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="font-semibold">Generic HTML</p>
                  </div>
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

export default EmbeddingGuide;
