import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form } from '../../types/form';
import { Save, Eye, Share, Settings, Layers, Monitor, Smartphone, Tablet, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Link } from 'react-router-dom';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { FieldCounter } from './FieldCounter';
import { useDebouncedFormUpdate } from '../../hooks/useDebouncedFormUpdate';
import ThemeToggle from '../ThemeToggle';

interface FormBuilderToolbarProps {
  form: Form;
  onFormUpdate: (form: Form) => void;
  onSave: () => void;
  saving: boolean;
  activeView: 'fields' | 'settings';
  onViewChange: (view: 'fields' | 'settings') => void;
  onPreview: () => void;
  totalFields?: number;
  visibleFields?: number;
  showAllFields?: boolean;
  onToggleShowAll?: () => void;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
}

export const FormBuilderToolbar: React.FC<FormBuilderToolbarProps> = ({
  form,
  onFormUpdate,
  onSave,
  saving,
  activeView,
  onViewChange,
  onPreview,
  totalFields = 0,
  visibleFields = 0,
  showAllFields = false,
  onToggleShowAll = () => {},
  hasUnsavedChanges = false,
  lastSaved,
}) => {
  // Use debounced updates for title and status changes to prevent excessive auto-saves
  const { debouncedUpdate, immediateUpdate } = useDebouncedFormUpdate({
    onFormUpdate,
    delay: 1000 // 1 second delay for UI updates
  });
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              F
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              FormsEdge
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Center Section - Form Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0 max-w-lg mx-6">
          <Input
            value={form.title}
            onChange={(e) => debouncedUpdate({ ...form, title: e.target.value })}
            onBlur={(e) => immediateUpdate({ ...form, title: e.target.value })}
            className="font-medium"
            placeholder="Form title"
          />
        </div>

        {/* Center Right Section - View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={activeView === 'fields' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('fields')}
              className="h-8"
            >
              <Layers className="h-4 w-4 mr-2" />
              Fields
            </Button>
            <Button
              variant={activeView === 'settings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('settings')}
              className="h-8"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Device Preview (Future) */}
          <div className="flex items-center rounded-lg border p-1 opacity-50">
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          <FieldCounter 
            totalFields={totalFields}
            visibleFields={visibleFields}
            showAllFields={showAllFields}
            onToggleShowAll={onToggleShowAll}
            hasUnsavedChanges={hasUnsavedChanges} 
          />
          
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Select
            value={form.status}
            onValueChange={(value: any) => debouncedUpdate({ ...form, status: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <SaveStatusIndicator
            isSaving={saving}
            lastSaved={lastSaved}
            hasUnsavedChanges={hasUnsavedChanges}
          />

          <ThemeToggle />

          <Button onClick={onSave} disabled={saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>

        </div>
      </div>
    </div>
  );
};