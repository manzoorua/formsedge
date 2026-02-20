import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Download, Search, Filter, Eye, Trash2, 
  Calendar, Users, FileText, ExternalLink, Code 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResponseTable } from '@/components/responses/ResponseTable';
import { ResponseExporter } from '@/components/responses/ResponseExporter';
import { ResponseDetail } from '@/components/responses/ResponseDetail';
import ThemeToggle from '@/components/ThemeToggle';

interface Form {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
}

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

const FormResponses = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (user && id) {
      fetchFormAndResponses();
    }
  }, [user, id]);

  const fetchFormAndResponses = async () => {
    try {
      // Check if user can access this form
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('id, title, description, owner_id')
        .eq('id', id)
        .single();

      if (formError) throw formError;

      // Check access permissions
      const { data: hasAccess } = await supabase
        .rpc('can_access_form', { form_id: id, user_id: user?.id });

      if (!hasAccess) {
        toast({
          title: "Access denied",
          description: "You don't have permission to view this form's responses",
          variant: "destructive",
        });
        return;
      }

      setForm(formData);

      // Use the secure function to fetch responses with proper access controls
      const { data: responsesData, error: responsesError } = await supabase
        .rpc('get_secure_form_responses', { form_id_param: id })
        .returns<FormResponse[]>();

      if (responsesError) throw responsesError;

      // Fetch answers for each response separately using the secure RLS policies
      const responsesWithAnswers = await Promise.all(
        (responsesData || []).map(async (response) => {
          // Use secure function that automatically masks sensitive data
          const { data: answers } = await supabase
            .rpc('get_secure_form_response_answers', { 
              response_id_param: response.id 
            });

          return {
            ...response,
            form_response_answers: answers || []
          };
        })
      );

      setResponses(responsesWithAnswers);
      setTotalResponses(responsesWithAnswers?.length || 0);

    } catch (error: any) {
      toast({
        title: "Error loading responses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!form) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredResponses = responses.filter(response => 
    response.respondent_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    response.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedResponses = responses.filter(r => !r.is_partial && r.submitted_at);
  const partialResponses = responses.filter(r => r.is_partial);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{form.title}</h1>
              <p className="text-sm text-muted-foreground">Form Responses</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link to="/docs/api">
                <Code className="h-4 w-4 mr-2" />
                API Docs
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/forms/${id}/analytics`}>
                <FileText className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/forms/${id}/embed`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Embed
              </Link>
            </Button>
            <ResponseExporter responses={responses} formTitle={form.title} form={form as any} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{completedResponses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partial</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{partialResponses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalResponses > 0 ? Math.round((completedResponses.length / totalResponses) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Response Management</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponseTable 
              responses={filteredResponses} 
              onViewResponse={setSelectedResponse}
            />
          </CardContent>
        </Card>
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <ResponseDetail 
          response={selectedResponse}
          formId={id!}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
};

export default FormResponses;