import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Trash2, Download, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FormResponse {
  id: string;
  created_at: string;
  updated_at: string;
  is_partial: boolean;
  submitted_at: string | null;
  respondent_email?: string;
  respondent_id?: string;
  form_response_answers: Array<{
    id: string;
    field_id: string;
    value: string;
    file_urls?: any;
  }>;
}

interface ResponseTableProps {
  responses: FormResponse[];
  onViewResponse: (response: FormResponse) => void;
}

export const ResponseTable = ({ responses, onViewResponse }: ResponseTableProps) => {
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResponses(responses.map(r => r.id));
    } else {
      setSelectedResponses([]);
    }
  };

  const handleSelectResponse = (responseId: string, checked: boolean) => {
    if (checked) {
      setSelectedResponses(prev => [...prev, responseId]);
    } else {
      setSelectedResponses(prev => prev.filter(id => id !== responseId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResponseStatus = (response: FormResponse) => {
    if (response.is_partial) {
      return <Badge variant="outline" className="text-warning border-warning">Partial</Badge>;
    }
    if (response.submitted_at) {
      return <Badge variant="default" className="bg-success text-success-foreground">Complete</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  const getAnswerPreview = (response: FormResponse) => {
    const answers = response.form_response_answers;
    if (answers.length === 0) return 'No answers';
    
    const firstAnswer = answers[0];
    const preview = firstAnswer.value?.substring(0, 50);
    return preview + (firstAnswer.value?.length > 50 ? '...' : '');
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <div className="mb-4">No responses found</div>
          <div className="text-sm">Responses will appear here once users submit your form</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedResponses.length > 0 && (
        <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedResponses.length} response(s) selected
          </span>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedResponses.length === responses.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Respondent</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedResponses.includes(response.id)}
                    onCheckedChange={(checked) => handleSelectResponse(response.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  {getResponseStatus(response)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {response.respondent_email || 'Anonymous'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {response.id.substring(0, 8)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm">
                    {getAnswerPreview(response)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {response.submitted_at 
                      ? formatDate(response.submitted_at)
                      : formatDate(response.created_at)
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewResponse(response)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};