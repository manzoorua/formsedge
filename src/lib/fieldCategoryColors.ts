import { FieldType } from '../types/form';

export type FieldCategory = 'basic' | 'choice' | 'advanced' | 'layout';

// Map field types to their categories
export const getFieldCategory = (fieldType: FieldType): FieldCategory => {
  const categoryMap: Record<FieldType, FieldCategory> = {
    // Basic Fields
    text: 'basic',
    email: 'basic',
    phone: 'basic',
    number: 'basic',
    date: 'basic',
    time: 'basic',
    textarea: 'basic',
    
    // Choice Fields
    checkbox: 'choice',
    radio: 'choice',
    select: 'choice',
    multiselect: 'choice',
    
    // Advanced Fields
    file: 'advanced',
    signature: 'advanced',
    rating: 'advanced',
    slider: 'advanced',
    matrix: 'advanced',
    calculated: 'advanced',
    
    // Layout Fields
    divider: 'layout',
    html: 'layout',
    pagebreak: 'layout',
    section: 'layout',
  };

  return categoryMap[fieldType] || 'basic';
};

// Get category-specific color classes for canvas field items
export const getFieldCategoryStyles = (fieldType: FieldType, isSelected: boolean) => {
  const category = getFieldCategory(fieldType);
  
  // Base styles that match the palette gradients but are more subtle for canvas items
  const categoryStyles = {
    basic: {
      base: 'bg-gradient-to-br from-blue-50/80 to-indigo-100/80 border-blue-200/60',
      hover: 'hover:from-blue-100/90 hover:to-indigo-200/90 hover:border-blue-300/80',
      selected: 'border-primary bg-gradient-to-br from-blue-100/40 to-primary/10 ring-2 ring-primary/20'
    },
    choice: {
      base: 'bg-gradient-to-br from-purple-50/80 to-violet-100/80 border-purple-200/60',
      hover: 'hover:from-purple-100/90 hover:to-violet-200/90 hover:border-purple-300/80',
      selected: 'border-primary bg-gradient-to-br from-purple-100/40 to-primary/10 ring-2 ring-primary/20'
    },
    advanced: {
      base: 'bg-gradient-to-br from-emerald-50/80 to-green-100/80 border-emerald-200/60',
      hover: 'hover:from-emerald-100/90 hover:to-green-200/90 hover:border-emerald-300/80',
      selected: 'border-primary bg-gradient-to-br from-emerald-100/40 to-primary/10 ring-2 ring-primary/20'
    },
    layout: {
      base: 'bg-gradient-to-br from-amber-50/80 to-orange-100/80 border-amber-200/60',
      hover: 'hover:from-amber-100/90 hover:to-orange-200/90 hover:border-amber-300/80',
      selected: 'border-primary bg-gradient-to-br from-amber-100/40 to-primary/10 ring-2 ring-primary/20'
    }
  };

  const styles = categoryStyles[category];
  
  if (isSelected) {
    return styles.selected;
  }
  
  return `${styles.base} ${styles.hover}`;
};