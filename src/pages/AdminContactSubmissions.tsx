import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Download, 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Building,
  User,
  Calendar,
  StickyNote,
  Trash2,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface ContactSubmission {
  id: string;
  inquiry_type: string;
  full_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

interface SubmissionNote {
  id: string;
  submission_id: string;
  admin_id: string;
  note: string;
  is_internal: boolean;
  created_at: string;
}

interface Counts {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  new: { color: 'bg-blue-500', icon: Clock },
  in_progress: { color: 'bg-yellow-500', icon: AlertCircle },
  resolved: { color: 'bg-green-500', icon: CheckCircle },
  closed: { color: 'bg-gray-500', icon: XCircle },
};

const priorityConfig: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const AdminContactSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, new: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [notes, setNotes] = useState<SubmissionNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    inquiry_type: 'all',
    search: '',
  });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke('manage-contact-submissions', {
        body: { action: 'list', filters },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw response.error;

      setSubmissions(response.data.submissions || []);
      setCounts(response.data.counts || { total: 0, new: 0, in_progress: 0, resolved: 0, closed: 0 });
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionDetails = async (submissionId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke('manage-contact-submissions', {
        body: { action: 'get_details', submission_id: submissionId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw response.error;

      setNotes(response.data.notes || []);
    } catch (error: any) {
      console.error('Error fetching details:', error);
    }
  };

  const updateSubmission = async (submissionId: string, updateData: Partial<ContactSubmission>) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke('manage-contact-submissions', {
        body: { action: 'update_status', submission_id: submissionId, update_data: updateData },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw response.error;

      toast.success('Submission updated');
      fetchSubmissions();
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(response.data.submission);
      }
    } catch (error: any) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedSubmission) return;

    setAddingNote(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke('manage-contact-submissions', {
        body: { 
          action: 'add_note', 
          submission_id: selectedSubmission.id, 
          note_data: { note: newNote.trim(), is_internal: true }
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw response.error;

      setNotes([response.data.note, ...notes]);
      setNewNote('');
      toast.success('Note added');
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke('manage-contact-submissions', {
        body: { action: 'delete_note', note_id: noteId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw response.error;

      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const exportCSV = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await supabase.functions.invoke('manage-contact-submissions', {
        body: { action: 'export_csv', filters },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.error) throw response.error;

      // Download CSV
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contact_submissions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Export downloaded');
    } catch (error: any) {
      console.error('Error exporting:', error);
      toast.error('Failed to export');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters.status, filters.inquiry_type]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchSubmissions();
    }, 300);
    return () => clearTimeout(debounce);
  }, [filters.search]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('contact-submissions-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_submissions' },
        () => {
          toast.info('New contact submission received');
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openDetail = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    fetchSubmissionDetails(submission.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Contact Submissions</h1>
          <p className="text-muted-foreground">Manage inquiries from the contact form</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSubmissions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{counts.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="text-2xl font-bold">{counts.new}</div>
          <div className="text-sm text-muted-foreground">New</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="text-2xl font-bold">{counts.in_progress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="text-2xl font-bold">{counts.resolved}</div>
          <div className="text-sm text-muted-foreground">Resolved</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-gray-500">
          <div className="text-2xl font-bold">{counts.closed}</div>
          <div className="text-sm text-muted-foreground">Closed</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, subject..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.inquiry_type} onValueChange={(v) => setFilters({ ...filters, inquiry_type: v })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Subject</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Priority</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No submissions found
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const StatusIcon = statusConfig[submission.status]?.icon || Clock;
                  return (
                    <tr
                      key={submission.id}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => openDetail(submission)}
                    >
                      <td className="p-4">
                        <div className="font-medium truncate max-w-[300px]">{submission.subject}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{submission.full_name}</div>
                        <div className="text-xs text-muted-foreground">{submission.email}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">
                          {submission.inquiry_type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusConfig[submission.status]?.color}`} />
                          <span className="capitalize text-sm">{submission.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${priorityConfig[submission.priority]} capitalize`}>
                          {submission.priority}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(submission.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.subject}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedSubmission && format(new Date(selectedSubmission.created_at), 'PPP p')}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedSubmission.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedSubmission.email}`} className="text-primary hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
                {selectedSubmission.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSubmission.phone}</span>
                  </div>
                )}
                {selectedSubmission.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSubmission.company}</span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Message</Label>
                <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <Select
                    value={selectedSubmission.status}
                    onValueChange={(v) => updateSubmission(selectedSubmission.id, { status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Priority</Label>
                  <Select
                    value={selectedSubmission.priority}
                    onValueChange={(v) => updateSubmission(selectedSubmission.id, { priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Admin Notes
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={addNote} disabled={addingNote || !newNote.trim()}>
                      {addingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {notes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="p-3 bg-muted rounded-lg group relative">
                          <p className="text-sm">{note.note}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(note.created_at), 'PPP p')}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactSubmissions;
