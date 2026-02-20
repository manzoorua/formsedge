import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FieldPalette, FieldType as PaletteFieldType } from './FieldPalette';
import { SimpleTransitionManager } from './SimpleTransitionManager';
import { Form } from '../../types/form';

interface SimpleFormSidebarProps {
  currentForm: Form;
  onFormSelect?: (formId: string) => void;
  onAddField?: (fieldType: PaletteFieldType) => void;
}

export const SimpleFormSidebar: React.FC<SimpleFormSidebarProps> = ({
  currentForm,
  onFormSelect,
  onAddField,
}) => {
  return (
    <div className="h-full bg-background border-r">
      <Tabs defaultValue="fields" className="h-full">
        <TabsList className="grid w-full grid-cols-2 m-2 h-8">
          <TabsTrigger value="fields" className="py-1">FIELDS</TabsTrigger>
          <TabsTrigger value="forms" className="py-1">FORMS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields" className="h-full mt-0 border-0 p-0">
          <FieldPalette onAddField={onAddField} />
        </TabsContent>
        
        <TabsContent value="forms" className="h-full mt-0 border-0 p-0">
          <SimpleTransitionManager
            currentForm={currentForm}
            onFormSelect={onFormSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};