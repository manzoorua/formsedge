import React, { useState } from 'react';
import { FormField, FormUrlParamConfig } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sparkles } from 'lucide-react';

interface RecallTokenInserterProps {
  fields: FormField[];
  urlParams?: FormUrlParamConfig[];
  onInsert: (token: string) => void;
}

export const RecallTokenInserter: React.FC<RecallTokenInserterProps> = ({
  fields,
  urlParams = [],
  onInsert,
}) => {
  const [open, setOpen] = useState(false);
  
  // Filter fields with ref
  const answerFields = fields
    .filter(f => f.ref && !['divider', 'html', 'pagebreak', 'section'].includes(f.type))
    .sort((a, b) => a.order_index - b.order_index);
  
  // Filter calculated fields for variables
  const variableFields = fields
    .filter(f => f.ref && f.type === 'calculated')
    .sort((a, b) => a.order_index - b.order_index);

  const handleInsert = (token: string) => {
    onInsert(token);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Recall
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <ScrollArea className="max-h-[400px]">
          <div className="p-4 space-y-4">
            {/* Answers Section */}
            {answerFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Answers</h4>
                <div className="space-y-1">
                  {answerFields.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => handleInsert(`{{field:${field.ref}}}`)}
                      className="w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{field.label}</span>
                        <code className="text-xs text-muted-foreground">
                          {'{{field:' + field.ref + '}}'}
                        </code>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* URL Parameters Section */}
            {urlParams.length > 0 && (
              <>
                {answerFields.length > 0 && <Separator />}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">URL Parameters</h4>
                  <div className="space-y-1">
                    {urlParams.map((param) => (
                      <button
                        key={param.name}
                        onClick={() => handleInsert(`{{param:${param.name}}}`)}
                        className="w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">{param.label || param.name}</span>
                          <code className="text-xs text-muted-foreground">
                            {'{{param:' + param.name + '}}'}
                          </code>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {/* Variables Section */}
            {variableFields.length > 0 && (
              <>
                {(answerFields.length > 0 || urlParams.length > 0) && <Separator />}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Variables (Calculated)</h4>
                  <div className="space-y-1">
                    {variableFields.map((field) => (
                      <button
                        key={field.id}
                        onClick={() => handleInsert(`{{var:${field.ref}}}`)}
                        className="w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">{field.label}</span>
                          <code className="text-xs text-muted-foreground">
                            {'{{var:' + field.ref + '}}'}
                          </code>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {answerFields.length === 0 && urlParams.length === 0 && variableFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No Recall options available. Add field references or URL parameters to use Recall.
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
