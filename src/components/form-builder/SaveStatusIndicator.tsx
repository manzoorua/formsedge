import React from 'react';
import { Badge } from '../ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isSaving,
  lastSaved,
  hasUnsavedChanges
}) => {
  if (isSaving) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3 animate-spin" />
        Saving...
      </Badge>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Unsaved changes
      </Badge>
    );
  }

  if (lastSaved) {
    return (
      <Badge variant="outline" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1">
      <CheckCircle2 className="h-3 w-3" />
      Saved
    </Badge>
  );
};