import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { useFormBuilderStore } from '../../stores/formBuilderStore';

interface FieldRecoveryProps {
  formId: string;
  userId: string;
}

export const FieldRecovery: React.FC<FieldRecoveryProps> = ({ formId, userId }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { loadForm } = useFormBuilderStore();

  const recoverFields = async () => {
    setIsRecovering(true);
    try {
      // Attempt to reload form data from database
      
      
      const { data: fieldsData, error } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('order_index');

      if (error) {
        console.error('Error recovering fields:', error);
        throw error;
      }

      
      
      if (!fieldsData || fieldsData.length === 0) {
        toast.error('No fields found in database to recover');
        return;
      }

      // Reload the form to restore state
      await loadForm(formId, userId);
      
      toast.success(`Recovered ${fieldsData.length} fields from database`);
    } catch (error: any) {
      console.error('Field recovery failed:', error);
      toast.error(`Recovery failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <AlertTriangle className="h-5 w-5" />
          Field Recovery Available
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
          It looks like there might be fields in the database that aren't showing in the interface. 
          You can try to recover them.
        </p>
        <Button 
          onClick={recoverFields}
          disabled={isRecovering}
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/20"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
          {isRecovering ? 'Recovering...' : 'Recover Fields'}
        </Button>
      </CardContent>
    </Card>
  );
};