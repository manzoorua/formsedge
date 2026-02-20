import React from 'react';
import { DndContext, DragEndEvent, closestCenter, pointerWithin, rectIntersection, CollisionDetection } from '@dnd-kit/core';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';
import { FormField, FieldType as FormFieldType } from '../../types/form';
import { FormBuilderToolbar } from './FormBuilderToolbar';
import { FormBuilderCanvas } from './FormBuilderCanvas';
import { FormBuilderSidebar } from './FormBuilderSidebar';
import { SimpleFormSidebar } from './SimpleFormSidebar';
import { FormPreview } from './FormPreview';
import { CollaborationIndicator } from './CollaborationIndicator';
import { useFormBuilderRefactored } from '../../hooks/useFormBuilderRefactored';
import { useFormNavigation } from '../../hooks/useFormNavigation';
import { useBeforeUnload } from '../../hooks/useBeforeUnload';
import { ErrorBoundaryWrapper } from '../ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FieldType as PaletteFieldType } from './FieldPalette';
import { useFormBuilderStore } from '../../stores/formBuilderStore';
import { toast } from 'sonner';

interface FormBuilderProps {
  formId?: string;
  onSave?: (form: any) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ formId, onSave }) => {
  const navigate = useNavigate();
  const {
    form,
    fields,
    isLoading,
    selectedFieldId,
    activeView,
    showPreview,
    setForm,
    updateFormSmart,
    addField,
    updateField,
    deleteField,
    duplicateField,
    reorderFields,
    setSelectedField,
    setActiveView,
    setShowPreview,
    saveForm,
    saveNow,
    isSaving,
    getActiveCollaborators,
    isRealtimeConnected,
  } = useFormBuilderRefactored(formId);

  // Get showAllFields state from store
  const { showAllFields, setShowAllFields } = useFormBuilderStore();

  const { navigateToFormWithSave } = useFormNavigation();
  
  // Get save state from store
  const storeState = useFormBuilderStore.getState();
  const { hasUnsavedChanges } = storeState;

  // Calculate visible field count
  const visibleFieldCount = showAllFields 
    ? fields.length 
    : fields.filter(field => {
        const conditionalLogic = field.conditional_logic || {};
        return !conditionalLogic.hidden;
      }).length;
  
  // Protect against accidental page closure with unsaved changes
  useBeforeUnload(hasUnsavedChanges);

  const handleFormSelect = async (newFormId: string) => {
    if (!form || newFormId === form.id) return;
    
    await navigateToFormWithSave(newFormId, form, saveForm);
    navigate(`/forms/${newFormId}`);
  };

  const handleSave = async () => {
    await saveForm();
    // Show success toast for manual saves
    toast.success('Form saved successfully');
    if (onSave && form) {
      onSave(form);
    }
  };

  const handleAddFieldFromPalette = (fieldType: PaletteFieldType) => {
    if (!form) {
      console.warn('Cannot add field: No form loaded');
      return;
    }

    const newField: FormField = {
      id: uuidv4(),
      form_id: form.id,
      type: fieldType.id as FormFieldType,
      label: fieldType.name,
      required: false,
      order_index: fields.length,
      options: ['checkbox', 'radio', 'select', 'multiselect'].includes(fieldType.id) 
        ? ['Option 1', 'Option 2'] 
        : undefined,
      created_at: new Date().toISOString(),
    };
    
    
    addField(newField);
    setSelectedField(newField.id);
    // Don't call markUnsavedChanges here - the store will handle it
  };

  // Custom collision detection that prioritizes canvas for new fields from palette
  const customCollisionDetection: CollisionDetection = (args) => {
    const { active, droppableContainers } = args;
    
    // Check if we're dragging a field type from the palette (not an existing field)
    const isDraggingFromPalette = active.data.current?.fieldType;
    
    if (isDraggingFromPalette) {
      // For palette items, prioritize the canvas droppable
      const canvasDroppable = Array.from(droppableContainers.values()).find(
        container => container.id === 'form-canvas'
      );
      
      if (canvasDroppable) {
        // Use pointer intersection first (more accurate for large drop zones)
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
          return pointerCollisions;
        }
        
        // Fallback to rect intersection for better coverage
        const rectCollisions = rectIntersection(args);
        if (rectCollisions.length > 0) {
          return rectCollisions;
        }
      }
    }
    
    // For existing fields being reordered, use closestCenter
    return closestCenter(args);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      return;
    }

    // Check if we're dragging a field type from the palette
    const fieldType = active.data.current?.fieldType;
    
    if (fieldType) {
      // Adding new field from palette - can drop anywhere on canvas
      const newField: FormField = {
        id: uuidv4(),
        form_id: form?.id || '',
        type: fieldType.id,
        label: fieldType.name,
        required: false,
        order_index: fields.length,
        options: ['checkbox', 'radio', 'select', 'multiselect'].includes(fieldType.id) 
          ? ['Option 1', 'Option 2'] 
          : undefined,
        created_at: new Date().toISOString(),
      };
      
      addField(newField);
      setSelectedField(newField.id);
      toast.success(`${fieldType.name} field added`);
    } else {
      // Reordering existing fields
      const oldIndex = fields.findIndex(field => field.id === active.id);
      const newIndex = fields.findIndex(field => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderFields(oldIndex, newIndex);
      }
    }
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    
    
    if ('_deleted' in updates) {
      
      deleteField(fieldId);
      return;
    }

    if ('_duplicate' in updates) {
      
      duplicateField(fieldId);
      return;
    }

    
    updateField(fieldId, updates);
  };

  

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading form...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Form ID: {formId || 'New Form'}
          </p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">Form not found</p>
          <p className="text-sm text-muted-foreground">
            The form with ID "{formId}" could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper onError={(error) => console.error('FormBuilder Error:', error)}>
      <DndContext collisionDetection={customCollisionDetection} onDragEnd={handleDragEnd}>
        <div className="h-screen flex flex-col bg-background">
          <div className="flex items-center justify-between border-b bg-background px-4 py-3">
            <ErrorBoundaryWrapper>
                <FormBuilderToolbar
                  form={form}
                  onFormUpdate={updateFormSmart}
                  onSave={handleSave}
                  saving={isSaving}
                  activeView={activeView}
                  onViewChange={setActiveView}
                  onPreview={() => setShowPreview(true)}
                  totalFields={fields.length}
                  visibleFields={visibleFieldCount}
                  showAllFields={showAllFields}
                  onToggleShowAll={() => setShowAllFields(!showAllFields)}
                  hasUnsavedChanges={hasUnsavedChanges}
                  lastSaved={null}
                />
            </ErrorBoundaryWrapper>
            <CollaborationIndicator 
              collaborators={getActiveCollaborators()}
              isRealtimeConnected={isRealtimeConnected}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <ErrorBoundaryWrapper>
                  <SimpleFormSidebar
                    currentForm={form}
                    onFormSelect={handleFormSelect}
                    onAddField={handleAddFieldFromPalette}
                  />
                </ErrorBoundaryWrapper>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={50} minSize={30}>
                <ErrorBoundaryWrapper>
                  <FormBuilderCanvas
                    fields={fields}
                    form={form}
                    selectedFieldId={selectedFieldId}
                    onFieldSelect={setSelectedField}
                    onFieldUpdate={handleFieldUpdate}
                    showAllFields={showAllFields}
                  />
                </ErrorBoundaryWrapper>
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                <ErrorBoundaryWrapper>
                  <FormBuilderSidebar
                    form={form}
                    fields={fields}
                    selectedFieldId={selectedFieldId}
                    activeView={activeView}
                    onFormUpdate={setForm}
                    onFieldUpdate={handleFieldUpdate}
                  />
                </ErrorBoundaryWrapper>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          <FormPreview
            open={showPreview}
            onClose={() => setShowPreview(false)}
            form={form}
            fields={fields}
          />
        </div>
      </DndContext>
    </ErrorBoundaryWrapper>
  );
};