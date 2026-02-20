import React from 'react';
import { FormField } from '../../types/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Star, Upload, ChevronDown, Folder } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useCalculations } from '../../hooks/useCalculations';
import { SignatureField } from './SignatureField';

interface FieldRendererProps {
  field: FormField;
  fields?: FormField[];
  formData?: Record<string, any>;
  isPreview?: boolean;
  value?: any;
  onChange?: (value: any) => void;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  fields = [],
  formData = {},
  isPreview = false,
  value,
  onChange,
}) => {
  const { calculateField } = useCalculations(fields, formData);
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            disabled={isPreview}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || 'Enter number'}
            disabled={isPreview}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            disabled={isPreview}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            disabled={isPreview}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            disabled={isPreview}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            rows={3}
          />
        );

      case 'checkbox':
        const checkboxOptions = Array.isArray(field.options) 
          ? field.options
              .map(opt => typeof opt === 'string' ? opt : opt.label || opt.value || opt)
              .filter(opt => opt && opt.trim() !== '') // Filter out empty strings
          : ['Option 1', 'Option 2'];
        return (
          <div className="space-y-2">
            {checkboxOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  disabled={isPreview}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onCheckedChange={(checked) => {
                    if (!onChange) return;
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (checked) {
                      newValue.push(option);
                    } else {
                      const idx = newValue.indexOf(option);
                      if (idx > -1) newValue.splice(idx, 1);
                    }
                    onChange(newValue);
                  }}
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm font-medium text-foreground">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        const radioOptions = Array.isArray(field.options) 
          ? field.options
              .map(opt => typeof opt === 'string' ? opt : opt.label || opt.value || opt)
              .filter(opt => opt && opt.trim() !== '') // Filter out empty strings
          : ['Option 1', 'Option 2'];
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            disabled={isPreview}
          >
            {radioOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm font-medium text-foreground">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'select':
        const selectOptions = Array.isArray(field.options) 
          ? field.options
              .map(opt => typeof opt === 'string' ? opt : opt.label || opt.value || opt)
              .filter(opt => opt && opt.trim() !== '') // Filter out empty strings
          : ['Option 1', 'Option 2'];
        return (
          <Select value={value || ''} onValueChange={onChange} disabled={isPreview}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const multiSelectOptions = Array.isArray(field.options) 
          ? field.options
              .map(opt => typeof opt === 'string' ? opt : opt.label || opt.value || opt)
              .filter(opt => opt && opt.trim() !== '') // Filter out empty strings
          : ['Option 1', 'Option 2'];
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md">
              {selectedValues.length > 0 ? (
                selectedValues.map((selectedValue, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {selectedValue}
                    {!isPreview && (
                      <button
                        onClick={() => {
                          const newValues = selectedValues.filter(v => v !== selectedValue);
                          onChange?.(newValues);
                        }}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    )}
                  </Badge>
                ))
              ) : (
                <span className="text-slate-600 dark:text-slate-300">Select options...</span>
              )}
            </div>
            {!isPreview && (
              <Select onValueChange={(val) => {
                if (!selectedValues.includes(val)) {
                  onChange?.([...selectedValues, val]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add option" />
                </SelectTrigger>
                <SelectContent>
                  {multiSelectOptions.filter(opt => !selectedValues.includes(opt)).map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center">
            <Upload className="h-6 w-6 mx-auto mb-1 text-foreground" />
            <p className="text-sm text-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <Button variant="secondary" size="sm" disabled={isPreview}>
              Choose Files
            </Button>
          </div>
        );

      case 'signature':
        return (
          <SignatureField
            value={value}
            onChange={onChange}
            disabled={isPreview}
          />
        );

      case 'rating':
        const maxRating = 5;
        return (
          <div className="flex gap-1">
            {Array.from({ length: maxRating }, (_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                disabled={isPreview}
                onClick={() => onChange?.(index + 1)}
              >
                <Star
                  className={`h-6 w-6 ${
                    (value || 0) > index
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <Slider
              value={[value || 0]}
              onValueChange={(values) => onChange?.(values[0])}
              max={100}
              step={1}
              disabled={isPreview}
            />
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>0</span>
              <span>{value || 0}</span>
              <span>100</span>
            </div>
          </div>
        );

      case 'divider':
        return <Separator className="my-4" />;

      case 'html':
        return (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded border-2 border-dashed border-slate-300 dark:border-slate-600">
            <p className="text-sm font-medium text-foreground">HTML Block</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Custom HTML content will be rendered here
            </p>
          </div>
        );

      case 'pagebreak':
        return (
          <div className="relative py-8">
            <Separator className="my-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge variant="outline" className="bg-background px-3 py-1">
                Page Break
              </Badge>
            </div>
          </div>
        );

      case 'section':
        const [isOpen, setIsOpen] = React.useState(true);
        return (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto border border-dashed rounded-lg"
                disabled={isPreview}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">
                    {field.label || 'Section Group'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded border-2 border-dashed border-slate-300 dark:border-slate-600">
                <p className="text-sm font-medium text-foreground">Section Content</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Fields in this section will be grouped together
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );

      case 'matrix':
        const rows = field.options?.rows || ['Row 1', 'Row 2'];
        const columns = field.options?.columns || ['Column 1', 'Column 2'];
        return (
          <div className="space-y-3">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="space-y-2">
                <div className="text-sm font-medium">{row}</div>
                <RadioGroup
                  value={value?.[rowIndex]?.toString() || ''}
                  onValueChange={(val) => {
                    const newValue = { ...value };
                    newValue[rowIndex] = parseInt(val);
                    onChange?.(newValue);
                  }}
                  disabled={isPreview}
                >
                  <div className="flex gap-4">
                    {columns.map((column, colIndex) => (
                      <div key={colIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={colIndex.toString()} id={`${field.id}-${rowIndex}-${colIndex}`} />
                        <Label htmlFor={`${field.id}-${rowIndex}-${colIndex}`} className="text-sm">
                          {column}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        );

      case 'calculated':
        const calculatedValue = calculateField(field);
        return (
          <div className="p-3 bg-muted rounded-md">
            <div className="text-lg font-semibold">{calculatedValue}</div>
          </div>
        );

      default:
        return (
          <Input
            placeholder="Unknown field type"
            disabled
          />
        );
    }
  };

  if (field.type === 'divider' || field.type === 'html' || field.type === 'pagebreak' || field.type === 'section') {
    return renderField();
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-bold text-foreground flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {field.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-tight">{field.description}</p>
      )}
      {renderField()}
    </div>
  );
};