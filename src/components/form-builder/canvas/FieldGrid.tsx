import React, { memo, useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FormField, Form } from '../../../types/form';
import { LayoutEngine } from '../layout/LayoutEngine';
import { SortableFieldItem } from '../SortableFieldItem';

interface FieldGridProps {
  fields: FormField[];
  form: Form;
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  showAllFields?: boolean;
}

export const FieldGrid = memo<FieldGridProps>(({
  fields,
  form,
  selectedFieldId,
  onFieldSelect,
  onFieldUpdate,
  showAllFields = false,
}) => {
  const layoutEngine = useMemo(() => {
    // Use minimum 4 columns to make field width controls functional
    const layoutConfig = {
      columns: Math.max(4, form.layout?.columns || 4),
      gridGap: (form.layout?.grid_gap as 'sm' | 'md' | 'lg') || 'md',
      responsive: form.layout?.responsive ?? true,
    };
    
    return new LayoutEngine(layoutConfig);
  }, [form.layout]);

  const visibleFields = useMemo(() => {
    if (showAllFields) {
      return fields;
    }
    return fields.filter(field => {
      // Safely handle conditional_logic that might be null/undefined
      const conditionalLogic = field.conditional_logic || {};
      return !conditionalLogic.hidden;
    });
  }, [fields, showAllFields]);

  const fieldPositions = useMemo(() => 
    layoutEngine.calculateFieldPositions(visibleFields),
    [layoutEngine, visibleFields]
  );

  const containerClasses = useMemo(() => 
    layoutEngine.getContainerClasses(),
    [layoutEngine]
  );

  // Create a position lookup map for O(1) access
  const positionMap = useMemo(() => {
    const map = new Map();
    fieldPositions.forEach(pos => map.set(pos.id, pos));
    return map;
  }, [fieldPositions]);

  if (visibleFields.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Start building your form</h3>
          <p className="text-foreground">
            Drag field types from the toolbar to add them to your form
          </p>
        </div>
      </div>
    );
  }

  return (
    <SortableContext items={visibleFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
      <div className={`w-full ${containerClasses}`}>
        {visibleFields.map((field) => {
          const position = positionMap.get(field.id);
          return (
            <SortableFieldItem
              key={field.id}
              field={field}
              fields={fields}
              formData={{}}
              isSelected={field.id === selectedFieldId}
              onSelect={() => onFieldSelect(field.id)}
              onUpdate={(updates) => onFieldUpdate(field.id, updates)}
              responsive={form.layout?.responsive}
              position={position}
            />
          );
        })}
      </div>
    </SortableContext>
  );
});

FieldGrid.displayName = 'FieldGrid';