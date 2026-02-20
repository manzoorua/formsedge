import React, { useState, useEffect } from 'react';
import { Form, FormTheme, FormField } from '../../types/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { FormLayoutSettings } from './FormLayoutSettings';
import { FormBackgroundSettings } from './FormBackgroundSettings';
import { UrlParametersSettings } from './UrlParametersSettings';
import { RecallTextInput } from './RecallTextInput';

import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

interface FormSettingsProps {
  form: Form;
  fields: FormField[];
  onUpdate: (form: Form) => void;
}

export const FormSettings: React.FC<FormSettingsProps> = ({
  form,
  fields,
  onUpdate,
}) => {
  return (
    <div 
      className="h-full rounded-none border-0 relative overflow-hidden"
      style={{
        background: 'var(--gradient-settings-card)',
        boxShadow: 'var(--shadow-settings-card)'
      }}
    >
      <div 
        className="px-6 py-5 border-b border-border/30 relative overflow-hidden"
        style={{
          background: 'var(--gradient-settings-header)',
          boxShadow: 'var(--shadow-settings-elevated)'
        }}
      >
        <div className="relative z-10">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Form Settings
          </h3>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40" />
        </div>
      </div>
      <div className="p-0">
        <ScrollArea className="h-[calc(100vh-9rem)]">
          <div className="p-6">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="responses">Response</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4 mt-4">
            <FormLayoutSettings form={form} onUpdate={onUpdate} />
          </TabsContent>

              <TabsContent value="design" className="space-y-4 mt-4">
                <FormBackgroundSettings form={form} onUpdate={onUpdate} />
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={form.primary_color}
                      onChange={(e) => onUpdate({ ...form, primary_color: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={form.primary_color}
                      onChange={(e) => onUpdate({ ...form, primary_color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={form.secondary_color}
                      onChange={(e) => onUpdate({ ...form, secondary_color: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={form.secondary_color}
                      onChange={(e) => onUpdate({ ...form, secondary_color: e.target.value })}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={form.font_family}
                    onValueChange={(value) => onUpdate({ ...form, font_family: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={form.logo_url || ''}
                    onChange={(e) => onUpdate({ ...form, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                {/* Custom CSS */}
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    value={form.custom_css || ''}
                    onChange={(e) => onUpdate({ ...form, custom_css: e.target.value })}
                    placeholder="/* Custom CSS styles */"
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="responses" className="space-y-4 mt-4">
                {/* Thank You Message */}
                <RecallTextInput
                  label="Thank You Message"
                  id="thank-you-message"
                  value={form.thank_you_message}
                  onChange={(value) => onUpdate({ ...form, thank_you_message: value })}
                  fields={fields}
                  urlParams={form.url_params_config}
                  multiline
                  placeholder="Thank you for your submission!"
                  hint="Personalize with {{field:name}}, {{param:source}}, etc."
                />

                {/* Redirect URL */}
                <RecallTextInput
                  label="Redirect URL (Optional)"
                  id="redirect-url"
                  value={form.redirect_url || ''}
                  onChange={(value) => onUpdate({ ...form, redirect_url: value })}
                  fields={fields}
                  urlParams={form.url_params_config}
                  placeholder="https://example.com/thank-you?name={{field:full_name}}"
                  hint="Use Recall tokens in URL parameters"
                />

                <Separator />

                {/* Partial Save */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Partial Save</Label>
                    <p className="text-xs text-muted-foreground">
                      Save progress automatically as users fill the form
                    </p>
                  </div>
                  <Switch
                    checked={form.enable_partial_save}
                    onCheckedChange={(checked) => onUpdate({ ...form, enable_partial_save: checked })}
                  />
                </div>

                {form.enable_partial_save && (
                  <div className="space-y-2">
                    <Label htmlFor="auto-save-interval">Auto-save Interval (seconds)</Label>
                    <Input
                      id="auto-save-interval"
                      type="number"
                      value={form.auto_save_interval}
                      onChange={(e) => onUpdate({ ...form, auto_save_interval: parseInt(e.target.value) || 10 })}
                      min={5}
                      max={60}
                    />
                  </div>
                )}

              </TabsContent>

              <TabsContent value="parameters" className="space-y-4 mt-4">
                <UrlParametersSettings form={form} onUpdate={onUpdate} />
              </TabsContent>

            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};