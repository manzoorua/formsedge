import React from 'react';
import { Button } from '../ui/button';
import { FileText, Eye } from 'lucide-react';

interface FieldCounterProps {
  totalFields: number;
  visibleFields: number;
  showAllFields: boolean;
  onToggleShowAll: () => void;
  hasUnsavedChanges: boolean;
  className?: string;
}

export const FieldCounter: React.FC<FieldCounterProps> = ({ 
  totalFields,
  visibleFields,
  showAllFields,
  onToggleShowAll,
  hasUnsavedChanges, 
  className 
}) => {
  const Icon = showAllFields ? Eye : FileText;
  const text = showAllFields 
    ? `${visibleFields} of ${totalFields} fields` 
    : `${totalFields} field${totalFields !== 1 ? 's' : ''}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onToggleShowAll}
        className={`gap-1 h-8 text-xs ${showAllFields ? 'border-primary bg-primary/10' : ''}`}
        aria-label={showAllFields ? 'Show only visible fields' : 'Show all fields including hidden'}
      >
        <Icon className="h-3 w-3" />
        {text}
      </Button>
    </div>
  );
};