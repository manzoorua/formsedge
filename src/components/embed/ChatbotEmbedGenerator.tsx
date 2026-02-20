import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, MessageSquare } from 'lucide-react';

interface ChatbotEmbedConfig {
  widgetId: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  width: string;
  height: string;
}

interface ChatbotEmbedGeneratorProps {
  config: ChatbotEmbedConfig;
  onCopy: (text: string) => void;
  disabled?: boolean;
}

export const ChatbotEmbedGenerator = ({ 
  config, 
  onCopy, 
  disabled = false 
}: ChatbotEmbedGeneratorProps) => {
  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const chatbotUrl = `${baseUrl}/chatbot/${config.widgetId}`;

    // Position mapping
    const positionStyles: Record<string, string> = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
    };

    return `<!-- FormsEdge Chatbot Embed Code -->
<iframe 
  src="${chatbotUrl}" 
  width="${config.width}" 
  height="${config.height}"
  frameborder="0"
  style="position: fixed; ${positionStyles[config.position]} border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;"
  allow="clipboard-write"
>
</iframe>`;
  };

  const embedCode = generateEmbedCode();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>Chatbot Embed Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={embedCode}
          readOnly
          rows={10}
          className="font-mono text-sm"
          disabled={disabled}
        />
        <Button
          onClick={() => onCopy(embedCode)}
          disabled={disabled}
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Chatbot Embed Code
        </Button>
        {disabled && (
          <p className="text-sm text-muted-foreground text-center">
            Configure chatbot settings to generate embed code
          </p>
        )}
      </CardContent>
    </Card>
  );
};
