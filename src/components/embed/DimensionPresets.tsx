import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DimensionPresetsProps {
  width: string;
  height: string;
  onWidthChange: (width: string) => void;
  onHeightChange: (height: string) => void;
}

export const DimensionPresets = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
}: DimensionPresetsProps) => {
  const widthPresets = [
    { label: 'Full Width', value: '100%' },
    { label: 'Standard', value: '600px' },
    { label: 'Compact', value: '400px' },
  ];

  const heightPresets = [
    { label: 'Standard', value: '600px' },
    { label: 'Tall', value: '800px' },
    { label: 'Auto', value: 'auto' },
  ];

  return (
    <div className="space-y-6">
      {/* Width */}
      <div className="space-y-3">
        <Label>Width</Label>
        <div className="flex gap-2 mb-2">
          {widthPresets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant={width === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onWidthChange(preset.value)}
              className="flex-1"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Input
          value={width}
          onChange={(e) => onWidthChange(e.target.value)}
          placeholder="e.g., 600px or 100%"
        />
      </div>

      {/* Height */}
      <div className="space-y-3">
        <Label>Height</Label>
        <div className="flex gap-2 mb-2">
          {heightPresets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant={height === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onHeightChange(preset.value)}
              className="flex-1"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Input
          value={height}
          onChange={(e) => onHeightChange(e.target.value)}
          placeholder="e.g., 600px or auto"
        />
      </div>
    </div>
  );
};
