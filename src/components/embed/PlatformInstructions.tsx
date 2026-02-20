import { Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PlatformStep {
  number: number;
  title: string;
  description: string;
  tip?: string;
}

interface PlatformInstructionsProps {
  platform: string;
  embedCode: string;
  onCopyCode: (code: string) => void;
}

const platformInstructions: Record<string, PlatformStep[]> = {
  wordpress: [
    {
      number: 1,
      title: 'Copy the embed code',
      description: 'Click the "Copy Embed Code" button above to copy your form\'s embed code to your clipboard.',
    },
    {
      number: 2,
      title: 'Open WordPress Editor',
      description: 'Navigate to the page where you want to embed the form. Click the "Add Block" (+) button in your editor, then search for "Custom HTML" and add it to your page.',
      tip: 'For Gutenberg editor, use "Custom HTML" block. For Classic editor, switch to "Text" mode before pasting.',
    },
    {
      number: 3,
      title: 'Paste and save',
      description: 'Paste the embed code into the Custom HTML block. Click "Update" or "Publish" to save your changes.',
    },
    {
      number: 4,
      title: 'Preview your form',
      description: 'View the page to see your embedded form live. The form will automatically adjust to your theme and look great on all devices.',
    },
  ],
  squarespace: [
    {
      number: 1,
      title: 'Copy the embed code',
      description: 'Click the "Copy Embed Code" button above to copy your form\'s embed code.',
    },
    {
      number: 2,
      title: 'Edit your Squarespace page',
      description: 'In the page editor, click where you want to add the form. Click the "+" icon to add a new block, then choose "Embed" from the block menu.',
      tip: 'Squarespace may require a Business plan or higher for custom code embedding.',
    },
    {
      number: 3,
      title: 'Paste and configure',
      description: 'In the embed settings, paste your code. Adjust width and height if needed, or leave them on auto for responsive sizing. Click outside the block to apply.',
    },
    {
      number: 4,
      title: 'Publish changes',
      description: 'Click "Save" at the top of the editor. Your form is now live on your Squarespace site.',
    },
  ],
  webflow: [
    {
      number: 1,
      title: 'Copy the embed code',
      description: 'Click the "Copy Embed Code" button above to copy your form\'s embed code.',
    },
    {
      number: 2,
      title: 'Add Custom Code component',
      description: 'Open your Webflow project in Designer. From the Add Elements panel, drag an "Embed" component onto your page where you want the form to appear.',
      tip: 'Set "Display" to "Block" on the embed component for better responsive behavior.',
    },
    {
      number: 3,
      title: 'Paste the code',
      description: 'Double-click the Embed component to open its settings. Paste your embed code into the text area, then click "Save & Close".',
    },
    {
      number: 4,
      title: 'Publish your site',
      description: 'Click "Publish" in the top right corner of Designer. Select the domains you want to publish to. Your form is now embedded and live.',
    },
  ],
  shopify: [
    {
      number: 1,
      title: 'Copy the embed code',
      description: 'Click the "Copy Embed Code" button above to copy your form\'s embed code.',
    },
    {
      number: 2,
      title: 'Access theme code editor',
      description: 'In your Shopify admin, go to Online Store → Themes. Click "Actions" dropdown next to your active theme, then select "Edit code".',
      tip: 'For page-specific forms, edit the page template file (e.g., page.contact.liquid). For store-wide forms, edit theme.liquid.',
    },
    {
      number: 3,
      title: 'Paste the code',
      description: 'Find the template file you want to edit (like page.liquid or a specific page template). Locate where you want the form to appear in the HTML, paste the embed code, and click "Save".',
    },
    {
      number: 4,
      title: 'Preview and publish',
      description: 'Click "Preview" in the theme editor to test your form. If everything looks good, the changes are automatically live on your store.',
    },
  ],
  wix: [
    {
      number: 1,
      title: 'Copy the embed code',
      description: 'Click the "Copy Embed Code" button above to copy your form\'s embed code.',
    },
    {
      number: 2,
      title: 'Add HTML element',
      description: 'Open your Wix editor and click the "Add" (+) button on the left sidebar. Navigate to "Embed" → "Custom Embeds" → "HTML iframe".',
      tip: 'Use "HTML iframe" for best compatibility with script-based embeds.',
    },
    {
      number: 3,
      title: 'Paste and configure',
      description: 'Click "Enter Code" in the HTML iframe settings. Paste your embed code, then adjust the element\'s size and position on your page as needed.',
    },
    {
      number: 4,
      title: 'Publish your site',
      description: 'Click "Publish" at the top right of the Wix editor. Your form is now live on your Wix site and ready to collect responses.',
    },
  ],
  html: [
    {
      number: 1,
      title: 'Copy the embed code',
      description: 'Click the "Copy Embed Code" button above to copy your form\'s embed code.',
      tip: 'The embed code contains an environment-specific script URL. Always copy the full code from this page—never modify the script URL or use examples from other sources.',
    },
    {
      number: 2,
      title: 'Open your HTML file',
      description: 'Use your preferred code editor to open the HTML file where you want to embed the form. Locate the page or section where the form should appear.',
      tip: 'Place the code right before the closing </body> tag for popup/slider modes, or inline within your content area for inline mode.',
    },
    {
      number: 3,
      title: 'Paste the code exactly as copied',
      description: 'Find the location in your HTML where you want the form (typically inside the <body> element). Paste the embed code exactly as copied, without modifying any URLs, and save the file.',
      tip: 'Do not change the script src URL—it must match your app\'s domain. If testing locally, the form will load from the script\'s origin, not from file:// protocol.',
    },
    {
      number: 4,
      title: 'Upload and test',
      description: 'Upload the modified HTML file to your web server. Visit the page in a browser to verify the form appears correctly and test form submission.',
      tip: 'For local testing before upload, the embed will work in local HTML files—the SDK automatically detects its origin from the script tag.',
    },
  ],
};

const platformNames: Record<string, string> = {
  wordpress: 'WordPress',
  squarespace: 'Squarespace',
  webflow: 'Webflow',
  shopify: 'Shopify',
  wix: 'Wix',
  html: 'Generic HTML',
};

export const PlatformInstructions = ({ platform, embedCode, onCopyCode }: PlatformInstructionsProps) => {
  const [copied, setCopied] = useState(false);
  const steps = platformInstructions[platform] || platformInstructions.html;

  const handleCopy = () => {
    onCopyCode(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          How to embed with {platformNames[platform] || 'your platform'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Follow these steps to add your form to your website
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-4">
            {/* Number circle */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {step.number}
            </div>
            
            {/* Content */}
            <div className="flex-1 space-y-2 pt-0.5">
              <h4 className="font-semibold text-foreground">{step.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              
              {/* Copy button for step 1 */}
              {step.number === 1 && (
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="mt-3"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Embed Code
                    </>
                  )}
                </Button>
              )}
              
              {/* Tip box */}
              {step.tip && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">💡 Tip:</span> {step.tip}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Help link */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          Need more help?{' '}
          <a 
            href="https://docs.formsedge.com/embedding" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            View detailed documentation
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
};
