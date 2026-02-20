import React, { memo } from 'react';
import { FormField } from '../../../types/form';
import { FieldRenderer } from '../FieldRenderer';
import { FieldToolbar } from './FieldToolbar';
import { getFieldCategoryStyles } from '../../../lib/fieldCategoryColors';

interface FieldItemProps {
  field: FormField;
  fields?: FormField[];
  formData?: Record<string, any>;
  isSelected: boolean;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
}

export const FieldItem = memo<FieldItemProps>(({
  field,
  fields = [],
  formData = {},
  isSelected,
  position,
  onSelect,
  onUpdate,
}) => {
  const handleDelete = () => {
    onUpdate({ id: field.id, _deleted: true } as any);
  };

  const handleDuplicate = () => {
    onUpdate({ id: field.id, _duplicate: true } as any);
  };

  const handleToggleVisibility = () => {
    onUpdate({ 
      conditional_logic: {
        ...field.conditional_logic,
        hidden: !field.conditional_logic?.hidden
      }
    });
  };

  // Generate position-based CSS classes if position is provided
  const positionClasses = position ? 
    `col-span-${position.width}` : 
    '';

  // Get category-specific styling based on field type
  const categoryStyles = getFieldCategoryStyles(field.type, isSelected);

  return (
    <div
      className={`group relative rounded-lg border transition-all cursor-pointer ${positionClasses} ${categoryStyles} ${field.conditional_logic?.hidden ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <FieldToolbar
        field={field}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onToggleVisibility={handleToggleVisibility}
      />

      {/* Field Content */}
      <div className="p-3">
        <FieldRenderer 
          field={field}
          fields={fields}
          formData={formData}
          isPreview 
        />
      </div>

      {/* Required Indicator */}
      {field.required && (
        <div className="absolute top-2 right-2">
          <span className="text-destructive text-sm font-medium">*</span>
        </div>
      )}
    </div>
  );
});

FieldItem.displayName = 'FieldItem';