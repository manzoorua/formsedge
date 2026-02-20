import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit2, Trash2, Link, Copy, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormSettingsDialog } from './FormSettingsDialog';
import { Form } from '@/types/form';

interface FormContextMenuProps {
  form: Form;
  onFormUpdate: (updatedForm: Form) => void;
  onFormDelete: (formId: string) => void;
  onFormDuplicate?: (newForm: Form) => void;
}

export const FormContextMenu: React.FC<FormContextMenuProps> = ({
  form,
  onFormUpdate,
  onFormDelete,
  onFormDuplicate,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(form.title);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRename = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Form title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('forms')
        .update({ title: newTitle.trim() })
        .eq('id', form.id)
        .select()
        .single();

      if (error) throw error;

      onFormUpdate({ ...form, title: newTitle.trim() });
      setIsRenameOpen(false);
      toast({
        title: "Success",
        description: "Form renamed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to rename form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (form.status !== 'published') {
      toast({
        title: "Form not published",
        description: "Only published forms can be shared",
        variant: "destructive",
      });
      return;
    }

    const formUrl = `${window.location.origin}/f/${form.id}`;
    
    try {
      await navigator.clipboard.writeText(formUrl);
      toast({
        title: "Success",
        description: "Form link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleLinkPage = () => {
    if (form.status !== 'published') {
      toast({
        title: "Form not published",
        description: "Only published forms can be opened",
        variant: "destructive",
      });
      return;
    }

    const formUrl = `${window.location.origin}/f/${form.id}`;
    window.open(formUrl, '_blank');
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      // First, duplicate the form
      const { data: newForm, error: formError } = await supabase
        .from('forms')
        .insert({
          title: `${form.title} (Copy)`,
          description: form.description,
          status: 'draft',
          is_public: form.is_public,
          accept_responses: form.accept_responses,
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
          font_family: form.font_family,
          
          enable_analytics: form.enable_analytics,
          enable_partial_save: form.enable_partial_save,
          auto_save_interval: form.auto_save_interval,
          thank_you_message: form.thank_you_message,
          redirect_url: form.redirect_url,
          webhook_url: form.webhook_url,
          custom_css: form.custom_css,
          logo_url: form.logo_url,
          branding_enabled: form.branding_enabled,
          branding_color: form.branding_color,
          branding_logo_url: form.branding_logo_url,
          collect_emails: form.collect_emails,
          limit_responses: form.limit_responses,
          max_responses: form.max_responses,
          notification_email: form.notification_email,
          custom_url: form.custom_url,
          owner_id: form.owner_id,
        })
        .select()
        .single();

      if (formError) throw formError;

      // Then, duplicate the form fields
      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', form.id);

      if (fieldsError) throw fieldsError;

      if (fields && fields.length > 0) {
        const newFields = fields.map(field => ({
          form_id: newForm.id,
          type: field.type,
          label: field.label,
          description: field.description,
          placeholder: field.placeholder,
          required: field.required,
          options: field.options,
          validation_rules: field.validation_rules,
          conditional_logic: field.conditional_logic,
          calculations: field.calculations,
          styling: field.styling,
          logic_conditions: field.logic_conditions,
          order_index: field.order_index,
        }));

        const { error: fieldsInsertError } = await supabase
          .from('form_fields')
          .insert(newFields);

        if (fieldsInsertError) throw fieldsInsertError;
      }

      const normalizedForm = {
        ...newForm,
        url_params_config: (newForm.url_params_config as unknown as any) || undefined,
        layout: (newForm.layout as any) || { columns: 1, grid_gap: 'md', responsive: true },
        background: (newForm.background as any) || undefined
      } as Form;
      
      onFormDuplicate?.(normalizedForm);
      
      toast({
        title: "Success",
        description: `"${newForm.title}" created. Opening editor...`,
      });
      
      // Navigate to the new form after a brief delay for user feedback
      setTimeout(() => {
        navigate(`/forms/${newForm.id}`);
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', form.id);

      if (error) throw error;

      onFormDelete(form.id);
      setIsDeleteOpen(false);
      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-background border border-border shadow-lg z-50"
        >
          <DropdownMenuItem 
            onClick={handleCopyLink}
            className="cursor-pointer"
          >
            <Link className="h-4 w-4 mr-2" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLinkPage}
            className="cursor-pointer"
            disabled={form.status !== 'published'}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Link page
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDuplicate}
            className="cursor-pointer"
            disabled={isLoading}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsSettingsOpen(true)}
            className="cursor-pointer"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => {
              setNewTitle(form.title);
              setIsRenameOpen(true);
            }}
            className="cursor-pointer"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Form</DialogTitle>
            <DialogDescription>
              Enter a new name for your form.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter form title"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isLoading || !newTitle.trim()}
            >
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <FormSettingsDialog
        form={form}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onFormUpdate={onFormUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form
              <strong> "{form.title}"</strong> and all of its responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};