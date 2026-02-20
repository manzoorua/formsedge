import React, { useState } from 'react';
import { Form } from '../../types/form';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Palette, Image, Upload, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormBackgroundSettingsProps {
  form: Form;
  onUpdate: (form: Form) => void;
}

export const FormBackgroundSettings: React.FC<FormBackgroundSettingsProps> = ({
  form,
  onUpdate,
}) => {
  const [colorInput, setColorInput] = useState(form.background?.value || '#ffffff');

  const updateBackground = (updates: Partial<Form['background']>) => {
    onUpdate({
      ...form,
      background: {
        ...form.background,
        ...updates,
      },
    });
  };

  const gradientPresets = [
    { name: 'Primary', value: 'linear-gradient(135deg, hsl(262 83% 58%), hsl(270 91% 68%))' },
    { name: 'Secondary', value: 'linear-gradient(135deg, hsl(189 94% 43%), hsl(189 100% 28%))' },
    { name: 'Hero', value: 'linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(189 94% 43%) 100%)' },
    { name: 'Sunset', value: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  ];

  const backgroundType = form.background?.type || 'color';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Palette className="h-4 w-4" />
        Background Settings
      </div>

      {/* Background Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Background Type</Label>
        <Select
          value={backgroundType}
          onValueChange={(value: 'color' | 'gradient' | 'image') =>
            updateBackground({ type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="color">Solid Color</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="image">Background Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color Background */}
      {backgroundType === 'color' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Background Color</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="color"
                value={colorInput}
                onChange={(e) => {
                  setColorInput(e.target.value);
                  updateBackground({ type: 'color', value: e.target.value });
                }}
                className="h-10"
              />
            </div>
            <Input
              type="text"
              value={colorInput}
              onChange={(e) => {
                setColorInput(e.target.value);
                updateBackground({ type: 'color', value: e.target.value });
              }}
              placeholder="#ffffff"
              className="flex-2"
            />
          </div>
        </div>
      )}

      {/* Gradient Background */}
      {backgroundType === 'gradient' && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Gradient Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {gradientPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-12 p-2"
                onClick={() => updateBackground({ type: 'gradient', value: preset.value })}
              >
                <div
                  className="w-full h-full rounded border border-border"
                  style={{ background: preset.value }}
                />
                <span className="ml-2 text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Custom Gradient CSS</Label>
            <Input
              value={form.background?.value || ''}
              onChange={(e) => updateBackground({ type: 'gradient', value: e.target.value })}
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <p className="text-xs text-muted-foreground">
              Enter CSS gradient syntax
            </p>
          </div>
        </div>
      )}

      {/* Image Background */}
      {backgroundType === 'image' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Background Image URL</Label>
            <div className="flex gap-2">
              <Input
                value={form.background?.value || ''}
                onChange={(e) => updateBackground({ type: 'image', value: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Settings */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Background Size</Label>
              <Select
                value={form.background?.size || 'cover'}
                onValueChange={(value) => updateBackground({ size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover (Fill)</SelectItem>
                  <SelectItem value="contain">Contain (Fit)</SelectItem>
                  <SelectItem value="auto">Auto (Original)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Background Position</Label>
              <Select
                value={form.background?.position || 'center'}
                onValueChange={(value) => updateBackground({ position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top left">Top Left</SelectItem>
                  <SelectItem value="top right">Top Right</SelectItem>
                  <SelectItem value="bottom left">Bottom Left</SelectItem>
                  <SelectItem value="bottom right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Overlay Opacity ({form.background?.opacity || 0}%)
              </Label>
              <Slider
                value={[form.background?.opacity || 0]}
                onValueChange={([value]) => updateBackground({ opacity: value })}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Add dark overlay to improve text readability
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {form.background && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Image className="h-4 w-4" />
            Preview
          </Label>
          <div
            className="w-full h-24 rounded-lg border border-border relative overflow-hidden"
            style={{
              ...(backgroundType === 'color' && { backgroundColor: form.background.value }),
              ...(backgroundType === 'gradient' && { background: form.background.value }),
              ...(backgroundType === 'image' && {
                backgroundImage: `url(${form.background.value})`,
                backgroundSize: form.background.size || 'cover',
                backgroundPosition: form.background.position || 'center',
                backgroundRepeat: 'no-repeat'
              })
            }}
          >
            {backgroundType === 'image' && form.background.opacity !== undefined && (
              <div 
                className="absolute inset-0 bg-background"
                style={{ opacity: form.background.opacity / 100 }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-foreground text-sm font-medium">Form Preview</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => onUpdate({ ...form, background: undefined })}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};