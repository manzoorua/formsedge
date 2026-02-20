import React, { memo } from 'react';
import { GripVertical, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../ui/button';
import { FormField } from '../../../types/form';

interface FieldToolbarProps {
  field: FormField;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  dragHandleProps?: any;
}

export const FieldToolbar = memo<FieldToolbarProps>(({
  field,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  dragHandleProps,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility();
  };

  return (
    <>
      {/* Drag Handle */}
      {dragHandleProps && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-grab active:cursor-grabbing"
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 bg-background"
            onClick={handleToggleVisibility}
          >
            {field.conditional_logic?.hidden ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 bg-background"
            onClick={handleDuplicate}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 bg-background text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </>
  );
});

FieldToolbar.displayName = 'FieldToolbar';