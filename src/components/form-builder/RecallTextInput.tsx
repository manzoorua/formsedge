import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RecallTokenInserter } from './RecallTokenInserter';
import { FormField, FormUrlParamConfig } from '@/types/form';

interface RecallTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fields: FormField[];
  urlParams?: FormUrlParamConfig[];
  multiline?: boolean;
  placeholder?: string;
  id?: string;
  hint?: string;
}

export const RecallTextInput: React.FC<RecallTextInputProps> = ({
  label,
  value,
  onChange,
  fields,
  urlParams,
  multiline = false,
  placeholder,
  id,
  hint,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleInsertToken = (token: string) => {
    if (!inputRef.current) return;
    
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    
    const newValue = value.substring(0, start) + token + value.substring(end);
    onChange(newValue);
    
    // Set cursor after inserted token
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <RecallTokenInserter
          fields={fields}
          urlParams={urlParams}
          onInsert={handleInsertToken}
        />
      </div>
      <InputComponent
        ref={inputRef as any}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
      />
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
};
