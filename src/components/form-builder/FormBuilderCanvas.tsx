import React, { useCallback, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Form, FormField } from '../../types/form';
import { FieldGrid } from './canvas/FieldGrid';
import { cn } from '../../lib/utils';


interface FormBuilderCanvasProps {
  fields: FormField[];
  form: Form;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  showAllFields?: boolean;
}

export const FormBuilderCanvas: React.FC<FormBuilderCanvasProps> = React.memo(({
  fields,
  form,
  selectedFieldId,
  onFieldSelect,
  onFieldUpdate,
  showAllFields = false,
}) => {
  const { setNodeRef } = useDroppable({
    id: 'form-canvas',
  });

  // Memoize callbacks to prevent unnecessary re-renders
  const handleFieldSelect = useCallback((fieldId: string) => {
    onFieldSelect(fieldId);
  }, [onFieldSelect]);

  const handleFieldUpdate = useCallback((fieldId: string, updates: Partial<FormField>) => {
    onFieldUpdate(fieldId, updates);
  }, [onFieldUpdate]);

  // Generate background styles from form settings
  const formBackgroundStyles = useMemo(() => {
    if (!form.background) return {};
    
    const { type, value, size, position, opacity } = form.background;
    
    if (type === 'color') {
      return { backgroundColor: value };
    } else if (type === 'gradient') {
      return { background: value };
    } else if (type === 'image') {
      return {
        backgroundImage: `url(${value})`,
        backgroundSize: size || 'cover',
        backgroundPosition: position || 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {};
  }, [form.background]);

  return (
    <div 
      className="h-full flex flex-col relative"
      style={{
        background: 'var(--gradient-canvas)',
        backgroundSize: '40px 40px',
        backgroundImage: 'var(--gradient-canvas-pattern)'
      }}
    >
      {/* Canvas Header */}
      <div 
        className="border-b border-border/50 backdrop-blur-sm px-6 py-4 relative overflow-hidden"
        style={{
          background: 'var(--gradient-canvas-header)',
          boxShadow: 'var(--shadow-canvas-header)'
        }}
      >
        <div className="relative z-10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Form Canvas - {form.title || 'Untitled Form'}
          </h2>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-50" />
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-auto p-8">
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-full rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
            fields.length === 0 
              ? "border-dashed border-primary/40 hover:border-primary/60 hover:bg-primary/5" 
              : "border-solid border-border/30"
          )}
          style={{
            ...(fields.length === 0 
              ? { background: 'var(--gradient-canvas-empty)' }
              : form.background 
                ? formBackgroundStyles 
                : { background: 'var(--gradient-canvas-container)' }
            ),
            boxShadow: fields.length === 0 
              ? 'var(--shadow-card)' 
              : 'var(--shadow-canvas-deep), var(--shadow-canvas-container)'
          }}
        >
          {/* Image overlay for readability */}
          {form.background?.type === 'image' && form.background.opacity !== undefined && form.background.opacity > 0 && fields.length > 0 && (
            <div 
              className="absolute inset-0 bg-background pointer-events-none z-0"
              style={{ opacity: form.background.opacity / 100 }}
            />
          )}
          {/* Form Description */}
          {form.description && (
            <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-accent/5">
              <p className="text-slate-600 dark:text-slate-300">
                {form.description}
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="p-6">
            {fields.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Start Building Your Form
                  </h3>
                  <p className="text-foreground mb-4">
                    Drag and drop fields from the left panel to create your form.
                    You can reorder, edit, and customize each field.
                  </p>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <p>• Choose from text inputs, dropdowns, checkboxes, and more</p>
                    <p>• Set up conditional logic and validation rules</p>
                    <p>• Customize the appearance and behavior</p>
                  </div>
                </div>
              </div>
            ) : (
            <FieldGrid
              fields={fields}
              form={form}
              selectedFieldId={selectedFieldId}
              onFieldSelect={handleFieldSelect}
              onFieldUpdate={handleFieldUpdate}
              showAllFields={showAllFields}
            />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FormBuilderCanvas.displayName = 'FormBuilderCanvas';