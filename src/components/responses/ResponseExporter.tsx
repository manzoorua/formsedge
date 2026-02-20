import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, FileText, Table, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/types/form';
import { FormUrlParamConfig } from '@/lib/urlParamValidation';

interface FormResponse {
  id: string;
  created_at: string;
  updated_at: string;
  is_partial: boolean;
  submitted_at: string | null;
  respondent_email?: string;
  respondent_id?: string;
  url_params?: Record<string, string>;
  form_response_answers: Array<{
    id: string;
    field_id: string;
    value: string;
    file_urls?: any;
  }>;
}

interface ResponseExporterProps {
  responses: FormResponse[];
  formTitle: string;
  form: Form;
}

export const ResponseExporter = ({ responses, formTitle, form }: ResponseExporterProps) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includePartial, setIncludePartial] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      // Filter responses based on settings
      const filteredResponses = includePartial 
        ? responses 
        : responses.filter(r => !r.is_partial && r.submitted_at);

      if (filteredResponses.length === 0) {
        toast({
          title: "No data to export",
          description: "No responses match the export criteria",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for export
      const exportData = filteredResponses.map(response => {
        const row: any = {};
        
        // Add metadata if requested
        if (includeMetadata) {
          row['Response ID'] = response.id;
          row['Submitted At'] = response.submitted_at || response.created_at;
          row['Status'] = response.is_partial ? 'Partial' : 'Complete';
          row['Respondent'] = response.respondent_email || 'Anonymous';
        }

        // Add URL parameters if configured
        if (response.url_params && form?.url_params_config) {
          form.url_params_config.forEach((paramConfig: FormUrlParamConfig) => {
            if (paramConfig.visible_in_exports !== false) {
              const colName = `param:${paramConfig.name}`;
              row[colName] = response.url_params![paramConfig.name] || '';
            }
          });
        }

        // Add answers
        response.form_response_answers.forEach((answer, index) => {
          row[`Answer ${index + 1}`] = answer.value;
        });

        return row;
      });

      // Generate and download file based on format
      if (exportFormat === 'csv') {
        downloadCSV(exportData, `${formTitle}_responses.csv`);
      } else if (exportFormat === 'excel') {
        // For demo purposes, we'll use CSV format
        // In a real implementation, you'd use a library like xlsx
        downloadCSV(exportData, `${formTitle}_responses.csv`);
      } else if (exportFormat === 'pdf') {
        // For demo purposes, we'll show a message
        toast({
          title: "PDF Export",
          description: "PDF export would be implemented with a PDF library",
        });
      }

      toast({
        title: "Export successful",
        description: `${filteredResponses.length} responses exported`,
      });

    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <Table className="h-4 w-4" />;
      case 'excel':
        return <FileText className="h-4 w-4" />;
      case 'pdf':
        return <Image className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Responses</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center space-x-2">
                      <Table className="h-4 w-4" />
                      <span>CSV File</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Excel File</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <span>PDF Report</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-partial">Include partial responses</Label>
                <Checkbox
                  id="include-partial"
                  checked={includePartial}
                  onCheckedChange={(checked) => setIncludePartial(checked as boolean)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="include-metadata">Include metadata</Label>
                <Checkbox
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-4">
                <div>Total responses: {responses.length}</div>
                <div>Complete responses: {responses.filter(r => !r.is_partial).length}</div>
                <div>Will export: {includePartial ? responses.length : responses.filter(r => !r.is_partial).length}</div>
              </div>
              
              <Button 
                onClick={exportData} 
                disabled={isExporting || responses.length === 0}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    {getFormatIcon(exportFormat)}
                    <span className="ml-2">Export {exportFormat.toUpperCase()}</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};