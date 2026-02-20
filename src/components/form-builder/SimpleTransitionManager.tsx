import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Form } from '../../types/form';

interface SimpleTransitionManagerProps {
  currentForm: Form;
  onFormSelect?: (formId: string) => void;
}

export const SimpleTransitionManager: React.FC<SimpleTransitionManagerProps> = ({
  currentForm,
  onFormSelect,
}) => {
  const { user } = useAuth();
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [currentTransition, setCurrentTransition] = useState<any>(null);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAvailableForms();
      loadCurrentTransition();
    }
  }, [user?.id, currentForm.id]);

  const loadAvailableForms = async () => {
    if (!user?.id) return;

    try {
      // First, get forms that already transition back to the current form
      const { data: reverseTransitions, error: reverseError } = await supabase
        .from('form_transitions')
        .select('from_form_id')
        .eq('to_form_id', currentForm.id);

      if (reverseError) throw reverseError;

      const excludedFormIds = reverseTransitions?.map(t => t.from_form_id) || [];

      // Get available forms, excluding current form and forms that would create circular transitions
      let query = supabase
        .from('forms')
        .select('*')
        .eq('owner_id', user.id)
        .neq('id', currentForm.id)
        .eq('status', 'published');

      // Only add the exclusion filter if there are IDs to exclude
      if (excludedFormIds.length > 0) {
        query = query.not('id', 'in', `(${excludedFormIds.join(',')})`);
      }

      const { data: forms, error } = await query;

      if (error) throw error;
      setAvailableForms((forms || []).map(form => ({
        ...form,
        url_params_config: (form.url_params_config as unknown as any) || undefined,
        layout: (form.layout as any) || { columns: 1, grid_gap: 'md', responsive: true }
      } as unknown as Form)));
    } catch (error) {
      console.error('Error loading available forms:', error);
      toast.error('Failed to load available forms');
    }
  };

  const loadCurrentTransition = async () => {
    try {
      const { data: transition, error } = await supabase
        .from('form_transitions')
        .select(`
          id,
          to_form_id,
          is_default,
          forms!form_transitions_to_form_id_fkey (
            id,
            title
          )
        `)
        .eq('from_form_id', currentForm.id)
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;
      setCurrentTransition(transition);
    } catch (error) {
      console.error('Error loading current transition:', error);
    }
  };

  const handleAddTransition = async () => {
    if (!selectedFormId || !user?.id) return;

    setIsLoading(true);
    try {
      // First, delete any existing transition
      if (currentTransition) {
        await handleDeleteTransition();
      }

      const { data, error } = await supabase
        .from('form_transitions')
        .insert([
          {
            from_form_id: currentForm.id,
            to_form_id: selectedFormId,
            is_default: true,
          },
        ])
        .select(`
          id,
          to_form_id,
          is_default,
          forms!form_transitions_to_form_id_fkey (
            id,
            title
          )
        `)
        .single();

      if (error) throw error;

      setCurrentTransition(data);
      setSelectedFormId('');
      toast.success('Form transition added successfully');
    } catch (error) {
      console.error('Error adding transition:', error);
      toast.error('Failed to add form transition');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransition = async () => {
    if (!currentTransition) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('form_transitions')
        .delete()
        .eq('id', currentTransition.id);

      if (error) throw error;

      setCurrentTransition(null);
      toast.success('Form transition removed');
    } catch (error) {
      console.error('Error deleting transition:', error);
      toast.error('Failed to remove form transition');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCardClick = () => {
    if (currentTransition?.to_form_id && onFormSelect) {
      onFormSelect(currentTransition.to_form_id);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="flex-shrink-0">
        <h3 className="text-sm font-medium mb-3">Form Transition</h3>
        
        {!currentTransition && (
          <div className="space-y-3">
            <Select
              value={selectedFormId}
              onValueChange={setSelectedFormId}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select form to transition to..." />
              </SelectTrigger>
              <SelectContent>
                {availableForms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleAddTransition}
              disabled={!selectedFormId || isLoading}
              className="w-full"
              size="sm"
            >
              Add Transition
            </Button>
          </div>
        )}
      </div>

      {currentTransition && (
        <div className="flex-shrink-0">
          <Card className="relative cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-800/50 border-2 border-teal-200 dark:border-teal-700 hover:from-teal-100 hover:to-cyan-200 dark:hover:from-teal-800/60 dark:hover:to-cyan-700/60 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-card transition-all duration-200 hover:scale-[1.02]" onClick={handleFormCardClick}>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground bg-background/80 dark:bg-background/60 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTransition();
              }}
              disabled={isLoading}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-background/80 dark:bg-background/60 rounded-full flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-sm font-bold text-teal-700 dark:text-teal-300">Transitions to</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 bg-background/60 dark:bg-background/40 backdrop-blur-sm rounded-lg m-3 mt-0">
              <p className="text-sm font-bold text-foreground">{currentTransition.forms?.title || 'Unknown Form'}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Click to edit this form
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {availableForms.length === 0 && !currentTransition && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            No published forms available for transition.
            <br />
            Create and publish another form first.
          </p>
        </div>
      )}
    </div>
  );
};