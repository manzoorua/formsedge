import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconPicker } from './IconPicker';

type EmbedMode = 'inline' | 'popup' | 'slidein';

interface PopupConfigSectionProps {
  mode: EmbedMode;
  config: {
    popupSize: 'large' | 'medium' | 'small';
    buttonText: string;
    buttonColor: string;
    buttonFontSize: number;
    buttonBorderRadius: number;
    buttonAsText: boolean;
    slideDirection?: 'left' | 'right';
    tabText?: string;
    buttonIcon?: string;
    iconSize?: number;
    tooltipText?: string;
  };
  onChange: (updates: Partial<PopupConfigSectionProps['config']>) => void;
}

const presetColors = [
  '#8B5CF6', // Primary purple
  '#0EA5E9', // Cyan
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
];

export const PopupConfigSection = ({ mode, config, onChange }: PopupConfigSectionProps) => {
  return (
    <Card className="p-6 space-y-6">
      {/* Popup Size */}
      {mode === 'popup' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Popup Size</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <Button
                key={size}
                variant={config.popupSize === size ? 'default' : 'outline'}
                onClick={() => onChange({ popupSize: size })}
                className="capitalize"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Button Text */}
      <div className="space-y-2">
        <Label htmlFor="button-text" className="text-sm font-medium">Button Text</Label>
        <div className="relative">
          <Input
            id="button-text"
            value={config.buttonText}
            onChange={(e) => {
              const text = e.target.value.slice(0, 24);
              onChange({ buttonText: text });
            }}
            maxLength={24}
            placeholder="Click me!"
            className="pr-16"
          />
          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
            {config.buttonText.length}/24
          </span>
        </div>
      </div>

      {/* Button Color */}
      <div className="space-y-2">
        <Label htmlFor="button-color" className="text-sm font-medium">Button Color</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="button-color"
            type="color"
            value={config.buttonColor}
            onChange={(e) => onChange({ buttonColor: e.target.value })}
            className="w-16 h-10 cursor-pointer"
          />
          <div className="flex gap-1">
            {presetColors.map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onChange({ buttonColor: color })}
                aria-label={`Set color to ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Font Size (px)</Label>
          <span className="text-sm text-muted-foreground">{config.buttonFontSize}</span>
        </div>
        <Slider
          value={[config.buttonFontSize]}
          onValueChange={([val]) => onChange({ buttonFontSize: val })}
          min={12}
          max={32}
          step={1}
        />
      </div>

      {/* Rounded Corners */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Rounded Corners (%)</Label>
          <span className="text-sm text-muted-foreground">{config.buttonBorderRadius}%</span>
        </div>
        <Slider
          value={[config.buttonBorderRadius]}
          onValueChange={([val]) => onChange({ buttonBorderRadius: val })}
          min={0}
          max={100}
          step={5}
        />
        
        {/* Visual Preview */}
        <div className="flex gap-3 justify-center mt-4">
          {[0, 50, 100].map(radius => (
            <div key={radius} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-10 flex items-center justify-center text-xs text-white font-medium transition-all"
                style={{
                  backgroundColor: config.buttonColor,
                  borderRadius: `${radius}%`
                }}
              >
                Text
              </div>
              <span className="text-xs text-muted-foreground">{radius}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Button/Text Toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Label htmlFor="button-as-text" className="text-sm font-medium">
            Change Button to Text
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Show text link instead of button
          </p>
        </div>
        <Switch
          id="button-as-text"
          checked={config.buttonAsText}
          onCheckedChange={(v) => onChange({ buttonAsText: v })}
        />
      </div>

      {/* Slide Direction (for slidein mode only) */}
      {mode === 'slidein' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Slide Direction</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={config.slideDirection === 'left' ? 'default' : 'outline'}
              onClick={() => onChange({ slideDirection: 'left' })}
            >
              From Left
            </Button>
            <Button
              variant={config.slideDirection === 'right' ? 'default' : 'outline'}
              onClick={() => onChange({ slideDirection: 'right' })}
            >
              From Right
            </Button>
          </div>
        </div>
      )}

      {/* Icon & Tooltip Section */}
      <div className="space-y-4 pt-4 border-t">
        <Label className="text-sm font-medium">Icon & Tooltip</Label>
        
        <IconPicker
          value={config.buttonIcon || ''}
          onChange={(icon) => onChange({ buttonIcon: icon })}
          mode={mode === 'slidein' ? 'tab' : 'button'}
        />
        
        {config.buttonIcon && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Icon Size (px)</Label>
              <span className="text-sm text-muted-foreground">{config.iconSize || 20}</span>
            </div>
            <Slider
              value={[config.iconSize || 20]}
              onValueChange={([val]) => onChange({ iconSize: val })}
              min={16}
              max={32}
              step={2}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="tooltip" className="text-sm">Tooltip Text</Label>
          <div className="relative">
            <Input
              id="tooltip"
              value={config.tooltipText || ''}
              onChange={(e) => onChange({ tooltipText: e.target.value.slice(0, 50) })}
              maxLength={50}
              placeholder="Hover text..."
              className="pr-16"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
              {(config.tooltipText || '').length}/50
            </span>
          </div>
        </div>
      </div>

      {/* Slider-specific: Tab Text */}
      {mode === 'slidein' && (
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="tab-text" className="text-sm font-medium">
            Side Tab Text
          </Label>
          <div className="relative">
            <Input
              id="tab-text"
              value={config.tabText || 'Try me!'}
              onChange={(e) => onChange({ tabText: e.target.value.slice(0, 15) })}
              maxLength={15}
              placeholder="Try me!"
              className="pr-16"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
              {(config.tabText || 'Try me!').length}/15
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This text appears on the side tab when the form is closed
          </p>
        </div>
      )}
    </Card>
  );
};
