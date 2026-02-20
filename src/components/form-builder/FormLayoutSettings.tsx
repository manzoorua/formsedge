import React from 'react';
import { Form } from '../../types/form';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { LayoutGrid, Grid, Smartphone, Monitor } from 'lucide-react';

interface FormLayoutSettingsProps {
  form: Form;
  onUpdate: (form: Form) => void;
}

export const FormLayoutSettings: React.FC<FormLayoutSettingsProps> = ({
  form,
  onUpdate,
}) => {
  const updateLayout = (updates: Partial<Form['layout']>) => {
    onUpdate({
      ...form,
      layout: {
        ...form.layout,
        ...updates,
      },
    });
  };

  const columns = form.layout?.columns || 1;
  const responsive = form.layout?.responsive ?? true;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <LayoutGrid className="h-4 w-4" />
        Form Layout Settings
      </div>

      {/* Grid Columns */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Grid Columns</Label>
        <Select
          value={columns.toString()}
          onValueChange={(value) => updateLayout({ columns: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 border border-border bg-muted rounded-sm"></div>
                1 Column
              </div>
            </SelectItem>
            <SelectItem value="2">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="w-3.5 h-4 border border-border bg-muted rounded-sm"></div>
                  <div className="w-3.5 h-4 border border-border bg-muted rounded-sm"></div>
                </div>
                2 Columns
              </div>
            </SelectItem>
            <SelectItem value="3">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="w-2 h-4 border border-border bg-muted rounded-sm"></div>
                  <div className="w-2 h-4 border border-border bg-muted rounded-sm"></div>
                  <div className="w-2 h-4 border border-border bg-muted rounded-sm"></div>
                </div>
                3 Columns
              </div>
            </SelectItem>
            <SelectItem value="4">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-4 border border-border bg-muted rounded-sm"></div>
                  <div className="w-1.5 h-4 border border-border bg-muted rounded-sm"></div>
                  <div className="w-1.5 h-4 border border-border bg-muted rounded-sm"></div>
                  <div className="w-1.5 h-4 border border-border bg-muted rounded-sm"></div>
                </div>
                4 Columns
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Maximum number of columns for field layout
        </p>
      </div>

      {/* Grid Gap */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Grid Spacing</Label>
        <Select
          value={form.layout?.grid_gap || 'gap-4'}
          onValueChange={(value) => updateLayout({ grid_gap: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gap-2">Small (8px)</SelectItem>
            <SelectItem value="gap-4">Medium (16px)</SelectItem>
            <SelectItem value="gap-6">Large (24px)</SelectItem>
            <SelectItem value="gap-8">Extra Large (32px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Responsive Behavior */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile Responsive
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically stack fields on mobile devices
            </p>
          </div>
          <Switch
            checked={responsive}
            onCheckedChange={(checked) => updateLayout({ responsive: checked })}
          />
        </div>
      </div>

      {/* Layout Preview */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Grid className="h-4 w-4" />
          Layout Preview
        </Label>
        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
              <Monitor className="h-3 w-3" />
              Desktop View
            </div>
            <div className={`grid grid-cols-${columns} gap-2`}>
              {Array.from({ length: columns * 2 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded border border-border"></div>
              ))}
            </div>
          </div>
          
          {responsive && (
            <div className="space-y-2 mt-4">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <Smartphone className="h-3 w-3" />
                Mobile View
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 bg-muted rounded border border-border"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};