import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Sparkles, Bell, Star, Heart, Zap, Gift, Mail, Phone, Send } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  mode: 'button' | 'tab';
}

const popularIcons = [
  { name: 'None', value: 'none', Icon: null },
  { name: 'Message', value: 'MessageCircle', Icon: MessageCircle },
  { name: 'Sparkles', value: 'Sparkles', Icon: Sparkles },
  { name: 'Bell', value: 'Bell', Icon: Bell },
  { name: 'Star', value: 'Star', Icon: Star },
  { name: 'Heart', value: 'Heart', Icon: Heart },
  { name: 'Zap', value: 'Zap', Icon: Zap },
  { name: 'Gift', value: 'Gift', Icon: Gift },
  { name: 'Mail', value: 'Mail', Icon: Mail },
  { name: 'Phone', value: 'Phone', Icon: Phone },
  { name: 'Send', value: 'Send', Icon: Send },
];

export const IconPicker = ({ value, onChange, mode }: IconPickerProps) => {
  const selectedIcon = popularIcons.find(icon => icon.value === value);
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Custom Icon</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select icon..." />
        </SelectTrigger>
        <SelectContent>
          {popularIcons.map(icon => {
            const Icon = icon.Icon;
            return (
              <SelectItem key={icon.value} value={icon.value}>
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{icon.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* Custom URL Input */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Or use custom icon URL</Label>
        <Input
          value={value.startsWith('http') ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/icon.svg"
          className="text-sm"
        />
      </div>
      
      {/* Preview */}
      {value && value !== 'none' && (
        <div className="mt-3 p-3 border rounded-lg bg-muted/50">
          <span className="text-xs text-muted-foreground mb-2 block">Preview:</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md w-fit">
            {selectedIcon?.Icon && value !== 'none' ? (
              <selectedIcon.Icon className="h-5 w-5" />
            ) : value.startsWith('http') ? (
              <img src={value} alt="Custom icon" className="h-5 w-5" />
            ) : null}
            <span className="text-sm font-medium">{mode === 'tab' ? 'Try me!' : 'Button Text'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
