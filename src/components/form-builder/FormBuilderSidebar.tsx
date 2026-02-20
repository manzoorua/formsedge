import React from 'react';
import { FieldSettings } from './FieldSettings';
import { FormSettings } from './FormSettings';
import { Form, FormField } from '../../types/form';

interface FormBuilderSidebarProps {
  form: Form;
  fields: FormField[];
  selectedFieldId: string | null;
  activeView: 'fields' | 'settings';
  onFormUpdate: (form: Form) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
}

export const FormBuilderSidebar: React.FC<FormBuilderSidebarProps> = ({
  form,
  fields,
  selectedFieldId,
  activeView,
  onFormUpdate,
  onFieldUpdate,
}) => {
  const selectedField = selectedFieldId 
    ? fields.find(f => f.id === selectedFieldId) 
    : null;

  return (
    <div 
      className="h-full relative overflow-hidden"
      style={{
        background: 'var(--gradient-sidebar-right)',
        backgroundSize: '32px 32px',
        backgroundImage: 'var(--gradient-sidebar-pattern)',
        boxShadow: 'var(--shadow-sidebar-border), var(--shadow-sidebar-deep)'
      }}
    >
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-60" />
      
      <div className="relative z-10 h-full">
        {activeView === 'fields' ? (
          <FieldSettings
            field={selectedField}
            fields={fields}
            onUpdate={(updates) => {
              if (selectedFieldId) {
                onFieldUpdate(selectedFieldId, updates);
              }
            }}
          />
        ) : (
          <FormSettings
            form={form}
            fields={fields}
            onUpdate={onFormUpdate}
          />
        )}
      </div>
    </div>
  );
};