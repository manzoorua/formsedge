import React from 'react';
import { FormField } from '../../types/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { LayoutGrid, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '../ui/button';

interface FieldLayoutControlsProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export const FieldLayoutControls: React.FC<FieldLayoutControlsProps> = ({
  field,
  onUpdate,
}) => {
  const widthOptions = [
    { value: 'full', label: 'Full Width (100%)', icon: '█' },
    { value: 'half', label: 'Half Width (50%)', icon: '██' },
    { value: 'quarter', label: 'Quarter Width (25%)', icon: '███' },
  ];

  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <LayoutGrid className="h-4 w-4" />
        Layout Settings
      </div>

      {/* Field Width */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Field Width</Label>
        <Select
          value={field.width || 'full'}
          onValueChange={(value: 'full' | 'half' | 'quarter') =>
            onUpdate({ width: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select width" />
          </SelectTrigger>
          <SelectContent>
            {widthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{option.icon}</span>
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Field Alignment */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Alignment</Label>
        <div className="flex gap-1">
          {alignmentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={field.alignment === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate({ alignment: option.value as 'left' | 'center' | 'right' })}
                className="flex-1"
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};