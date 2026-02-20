import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Type, 
  AtSign, 
  Phone, 
  Hash, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Radio, 
  ChevronDown, 
  Upload, 
  Star, 
  Sliders, 
  Grid, 
  Minus,
  FileText,
  Code,
  List,
  PenTool,
  MoreHorizontal,
  FolderOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export interface FieldType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'choice' | 'advanced' | 'layout';
  description: string;
}

const FIELD_TYPES: FieldType[] = [
  // Basic Fields
  { id: 'text', name: 'Text Input', icon: Type, category: 'basic', description: 'Single line text input' },
  { id: 'email', name: 'Email', icon: AtSign, category: 'basic', description: 'Email address field' },
  { id: 'phone', name: 'Phone', icon: Phone, category: 'basic', description: 'Phone number input' },
  { id: 'number', name: 'Number', icon: Hash, category: 'basic', description: 'Numeric input field' },
  { id: 'date', name: 'Date', icon: Calendar, category: 'basic', description: 'Date picker' },
  { id: 'time', name: 'Time', icon: Clock, category: 'basic', description: 'Time picker' },
  { id: 'textarea', name: 'Long Text', icon: FileText, category: 'basic', description: 'Multi-line text area' },
  
  // Choice Fields
  { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, category: 'choice', description: 'Multiple selection' },
  { id: 'radio', name: 'Radio', icon: Radio, category: 'choice', description: 'Single selection' },
  { id: 'select', name: 'Dropdown', icon: ChevronDown, category: 'choice', description: 'Dropdown selection' },
  { id: 'multiselect', name: 'Multi-Select', icon: List, category: 'choice', description: 'Multiple dropdown selection' },
  
  // Advanced Fields
  { id: 'file', name: 'File Upload', icon: Upload, category: 'advanced', description: 'File upload field' },
  { id: 'signature', name: 'Signature', icon: PenTool, category: 'advanced', description: 'Digital signature capture' },
  { id: 'rating', name: 'Rating', icon: Star, category: 'advanced', description: 'Star rating field' },
  { id: 'slider', name: 'Slider', icon: Sliders, category: 'advanced', description: 'Range slider' },
  { id: 'matrix', name: 'Matrix', icon: Grid, category: 'advanced', description: 'Matrix question grid' },
  
  // Layout Elements
  { id: 'divider', name: 'Divider', icon: Minus, category: 'layout', description: 'Visual separator' },
  { id: 'html', name: 'HTML Block', icon: Code, category: 'layout', description: 'Custom HTML content' },
  { id: 'pagebreak', name: 'Page Break', icon: MoreHorizontal, category: 'layout', description: 'Form pagination' },
  { id: 'section', name: 'Section', icon: FolderOpen, category: 'layout', description: 'Collapsible section group' },
];

const CATEGORIES = [
  { key: 'basic', label: 'Basic Fields' },
  { key: 'choice', label: 'Choice Fields' },
  { key: 'advanced', label: 'Advanced' },
  { key: 'layout', label: 'Layout' },
] as const;

interface DraggableFieldTypeProps {
  fieldType: FieldType;
  onAddField?: (fieldType: FieldType) => void;
}

const DraggableFieldType: React.FC<DraggableFieldTypeProps> = ({ fieldType, onAddField }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: fieldType.id,
    data: { fieldType },
  });

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click during drag
    if (isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddField) {
      
      onAddField(fieldType);
    }
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  const Icon = fieldType.icon;

  // Different gradient backgrounds for each category
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-800/50 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-200 dark:hover:from-blue-800/60 dark:hover:to-indigo-700/60 hover:border-blue-300 dark:hover:border-blue-600';
      case 'choice':
        return 'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/50 dark:to-violet-800/50 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-violet-200 dark:hover:from-purple-800/60 dark:hover:to-violet-700/60 hover:border-purple-300 dark:hover:border-purple-600';
      case 'advanced':
        return 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/50 dark:to-green-800/50 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-200 dark:hover:from-emerald-800/60 dark:hover:to-green-700/60 hover:border-emerald-300 dark:hover:border-emerald-600';
      case 'layout':
        return 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/50 dark:to-orange-800/50 border-amber-200 dark:border-amber-700 hover:from-amber-100 hover:to-orange-200 dark:hover:from-amber-800/60 dark:hover:to-orange-700/60 hover:border-amber-300 dark:hover:border-amber-600';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-slate-200 dark:hover:from-gray-800/60 dark:hover:to-slate-700/60 hover:border-gray-300 dark:hover:border-gray-600';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`group cursor-pointer hover:cursor-grab active:cursor-grabbing p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-card hover:scale-[1.02] ${getCategoryStyles(fieldType.category)} ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={`Click to add or drag to position: ${fieldType.name}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-background/80 dark:bg-background/60 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{fieldType.name}</p>
          <p className="text-xs text-muted-foreground truncate">{fieldType.description}</p>
        </div>
      </div>
    </div>
  );
};

interface FieldPaletteProps {
  onAddField?: (fieldType: FieldType) => void;
}

export const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField }) => {
  const getCategoryHeaderStyles = (categoryKey: string) => {
    switch (categoryKey) {
      case 'basic':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'choice':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700';
      case 'advanced':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700';
      case 'layout':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <Card className="h-full bg-gradient-to-b from-background to-muted/30 border-2">
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-6rem)]">
          <div className="pt-4 px-4 pb-4 space-y-6">
            {CATEGORIES.map((category, index) => (
              <div key={category.key} className={index === 0 ? "" : "pt-2"}>
                <div className={`font-bold text-sm mb-3 uppercase tracking-wide px-3 py-2 rounded-lg border ${getCategoryHeaderStyles(category.key)}`}>
                  {category.label}
                </div>
                <div className="space-y-3">
                  {FIELD_TYPES.filter(field => field.category === category.key).map((fieldType) => (
                    <DraggableFieldType key={fieldType.id} fieldType={fieldType} onAddField={onAddField} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};