import React from 'react';
import { useParams } from 'react-router-dom';
import { FormBuilder as FormBuilderComponent } from '../components/form-builder/FormBuilder';
import { Form } from '../types/form';

export default function FormBuilder() {
  const { id } = useParams();
  
  // Handle both /forms/new and /forms/:id routes
  // If there is no id (undefined), treat it as "new"
  const formId = id ?? 'new';

  const handleSave = (form: Form) => {
    
  };

  return (
    <FormBuilderComponent 
      formId={formId} 
      onSave={handleSave}
    />
  );
}