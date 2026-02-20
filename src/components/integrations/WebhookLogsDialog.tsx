import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, CheckCircle, XCircle, AlertCircle, Clock, 
  Copy, RefreshCw, Loader2, ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';

interface WebhookLog {
  id: string;
  event_id: string;
  status: string;
  attempt: number;
  url: string;
  http_status: number | null;
  error_message: string | null;
  request_body: any;
  response_body: string | null;
  created_at: string;
  updated_at: string;
  event_type: string;
  form_id: string;
  response_id: string | null;
}

interface WebhookLogsDialogProps {
  integrationId: string;
  integrationName: string;
}

export const WebhookLogsDialog = ({ integrationId, integrationName }: WebhookLogsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, integrationId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('webhook_delivery_logs')
        .select('*')
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading logs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (log: WebhookLog) => {
    if (!log.response_id) {
      toast({
        title: "Cannot retry",
        description: "This webhook has no associated response ID",
        variant: "destructive",
      });
      return;
    }

    setRetryingId(log.id);
    try {
      const { error } = await supabase.functions.invoke('webhook-dispatcher', {
        body: {
          formId: log.form_id,
          responseId: log.response_id,
        }
      });

      if (error) throw error;

      toast({
        title: "Webhook retried",
        description: "The webhook has been queued for retry",
      });

      // Reload logs after a short delay
      setTimeout(loadLogs, 2000);
    } catch (error: any) {
      toast({
        title: "Retry failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRetryingId(null);
    }
  };

  const copyEventId = (eventId: string) => {
    navigator.clipboard.writeText(eventId);
    toast({
      title: "Copied",
      description: "Event ID copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'retrying':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failed: 'destructive',
      pending: 'secondary',
      retrying: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getHttpStatusColor = (status: number | null) => {
    if (!status) return 'text-muted-foreground';
    if (status >= 200 && status < 300) return 'text-success';
    if (status >= 400 && status < 500) return 'text-warning';
    if (status >= 500) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FileText className="h-3 w-3 mr-1" />
          View Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Webhook Delivery Logs</DialogTitle>
          <DialogDescription>
            {integrationName} - Recent webhook deliveries
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadLogs} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {logs.length} {logs.length === 1 ? 'log' : 'logs'}
          </div>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No webhook logs found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {statusFilter !== 'all' ? 'Try changing the filter' : 'Logs will appear here after form submissions'}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {logs.map((log) => (
                <AccordionItem key={log.id} value={log.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(log.status)}
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(log.status)}
                            <span className={`text-sm font-mono ${getHttpStatusColor(log.http_status)}`}>
                              {log.http_status || 'N/A'}
                            </span>
                            {log.attempt > 1 && (
                              <Badge variant="outline" className="text-xs">
                                Attempt {log.attempt}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {/* Event Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Event ID:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.event_id}
                            </code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyEventId(log.event_id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">URL:</span>
                          <a 
                            href={log.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {log.url.substring(0, 50)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {log.error_message && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                            <span className="text-sm font-medium text-destructive">Error:</span>
                            <p className="text-sm text-destructive mt-1">{log.error_message}</p>
                          </div>
                        )}
                      </div>

                      {/* Request Body */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Request Body:</span>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                          {JSON.stringify(log.request_body, null, 2)}
                        </pre>
                      </div>

                      {/* Response Body */}
                      {log.response_body && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Response Body:</span>
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                            {log.response_body}
                          </pre>
                        </div>
                      )}

                      {/* Actions */}
                      {log.status === 'failed' && log.response_id && (
                        <div className="flex justify-end pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRetry(log)}
                            disabled={retryingId === log.id}
                          >
                            {retryingId === log.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                Retrying...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Retry Webhook
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
