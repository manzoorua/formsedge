import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { FormField } from '../../types/form';
import { FieldRenderer } from './FieldRenderer';
import { Button } from '../ui/button';

interface SortableFieldItemProps {
  field: FormField;
  fields?: FormField[];
  formData?: Record<string, any>;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  responsive?: boolean;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  fields = [],
  formData = {},
  isSelected,
  onSelect,
  onUpdate,
  responsive = false,
  position,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Generate grid classes based on calculated position
  const getGridClasses = () => {
    if (!position) {
      // Fallback to width-based classes if no position calculated
      switch (field.width) {
        case 'quarter':
          return 'col-span-1';
        case 'half':
          return 'col-span-2';
        case 'full':
        default:
          return 'col-span-full';
      }
    }
    
    // Use col-span-full for full width fields regardless of calculated width
    if (field.width === 'full') {
      return responsive ? 'col-span-full max-md:col-span-full' : 'col-span-full';
    }
    
    const colSpan = `col-span-${position.width}`;
    return responsive ? `${colSpan} max-md:col-span-full` : colSpan;
  };

  // Generate alignment classes
  const getAlignmentClass = () => {
    switch (field.alignment) {
      case 'center':
        return 'mx-auto';
      case 'right':
        return 'ml-auto';
      case 'left':
      default:
        return '';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be handled by the parent component
    onUpdate({ id: field.id, _deleted: true } as any);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ id: field.id, _duplicate: true } as any);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ 
      conditional_logic: {
        ...field.conditional_logic,
        hidden: !field.conditional_logic?.hidden
      }
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't prevent default or stop propagation for better click handling
    onSelect();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border-2 transition-all cursor-pointer ${getGridClasses()} ${getAlignmentClass()} ${
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
      } ${field.conditional_logic?.hidden ? 'opacity-50' : ''}`}
      onClick={handleClick}
    >
      {/* Drag Handle & Controls */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
            onClick={handleToggleVisibility}
          >
            {field.conditional_logic?.hidden ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
            onClick={handleDuplicate}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

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
};