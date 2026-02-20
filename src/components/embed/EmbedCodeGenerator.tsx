import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Code, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface EmbedConfig {
  type: 'iframe' | 'popup' | 'slider' | 'widget';
  width: string;
  height: string;
  position: string;
  trigger: string;
  theme: string;
  borderRadius?: string;
  customCss?: string;
  triggerValue?: string;
  hideTitle?: boolean;
  hideDescription?: boolean;
  showBranding?: boolean;
}

interface EmbedCodeGeneratorProps {
  formId: string;
  config: EmbedConfig;
  onCopy: (text: string) => void;
  disabled: boolean;
  codeType?: 'iframe' | 'script';
  isAutoSwitched?: boolean;
}

export const EmbedCodeGenerator = ({ 
  formId, 
  config, 
  onCopy, 
  disabled,
  codeType = 'iframe',
  isAutoSwitched = false 
}: EmbedCodeGeneratorProps) => {
  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    
    // Generate simple iframe code (only for basic features)
    if (codeType === 'iframe' || config.type === 'iframe') {
      const params = new URLSearchParams();
      params.append('embed', '1');
      
      if (config.theme && config.theme !== 'light') {
        params.append('theme', config.theme);
      }
      if (config.hideTitle) {
        params.append('hideTitle', 'true');
      }
      if (config.hideDescription) {
        params.append('hideDescription', 'true');
      }
      
      const formUrl = `${baseUrl}/f/${formId}?${params.toString()}`;
      
      return `<iframe 
  src="${formUrl}" 
  width="${config.width}" 
  height="${config.height}"
  frameborder="0"
  style="border: none; border-radius: 8px;">
</iframe>`;
    }

    // Generate script-based code for advanced features
    return `<!-- FormsEdge Embed Code -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/embed.js';
    script.setAttribute('data-form-id', '${formId}');
    script.setAttribute('data-embed-type', '${config.type}');
    document.head.appendChild(script);
  })();
</script>`;
  };

  const embedCode = generateEmbedCode();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>Embed Code</span>
          </CardTitle>
          {isAutoSwitched && (
            <Badge variant="outline" className="text-xs">
              Auto-switched to script
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAutoSwitched && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Using script-based embed for advanced features. 
              Disable custom triggers, popup modes, or advanced styling to use simple iframe.
            </AlertDescription>
          </Alert>
        )}
        
        <Textarea
          value={embedCode}
          readOnly
          rows={codeType === 'script' ? 10 : 8}
          className="font-mono text-sm"
          disabled={disabled}
        />
        <Button
          onClick={() => onCopy(embedCode)}
          disabled={disabled}
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Embed Code
        </Button>
        {disabled && (
          <p className="text-sm text-muted-foreground text-center">
            Publish your form to generate embed code
          </p>
        )}
      </CardContent>
    </Card>
  );
};