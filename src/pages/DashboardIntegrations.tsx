import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
interface Form {
  id: string;
  title: string;
  status: string;
  created_at: string;
}
interface Integration {
  id: string;
  form_id: string;
  integration_type: string;
  name: string;
  status: string;
  is_active: boolean;
}
export default function DashboardIntegrations() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [forms, setForms] = useState<Form[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchFormsAndIntegrations();
    }
  }, [user]);
  const fetchFormsAndIntegrations = async () => {
    try {
      // Fetch user's forms
      const {
        data: formsData,
        error: formsError
      } = await supabase.from("forms").select("id, title, status, created_at").eq("owner_id", user?.id).order("created_at", {
        ascending: false
      });
      if (formsError) throw formsError;

      // Fetch all integrations for user's forms
      const formIds = formsData?.map(form => form.id) || [];
      let integrationsData: Integration[] = [];
      if (formIds.length > 0) {
        const {
          data: integData,
          error: integError
        } = await supabase.from("form_integrations").select("id, form_id, integration_type, name, status, is_active").in("form_id", formIds);
        if (integError) throw integError;
        integrationsData = integData || [];
      }
      setForms(formsData || []);
      setIntegrations(integrationsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load forms and integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getFormIntegrations = (formId: string) => {
    return integrations.filter(integration => integration.form_id === formId);
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };
  const getStatusBadge = (status: string) => {
    const variant = status === 'connected' ? 'default' : status === 'error' ? 'destructive' : 'secondary';
    return <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>;
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="flex items-center gap-2 font-semibold text-zinc-600 text-2xl">
                <Zap className="h-8 w-8" />
                Integrations
              </h1>
              <p className="text-muted-foreground">
                Manage integrations for all your forms
              </p>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        {forms.length === 0 ? <Card>
            <CardContent className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No forms found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first form to start using integrations
              </p>
              <Button asChild>
                <Link to="/forms/new">Create New Form</Link>
              </Button>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map(form => {
          const formIntegrations = getFormIntegrations(form.id);
          const activeIntegrations = formIntegrations.filter(i => i.is_active);
          return <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{form.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {form.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(form.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Integration Status */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Integration Status</h4>
                        {formIntegrations.length === 0 ? <p className="text-sm text-muted-foreground">
                            No integrations configured
                          </p> : <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Active integrations:</span>
                              <Badge variant="secondary">
                                {activeIntegrations.length} of {formIntegrations.length}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {formIntegrations.slice(0, 3).map(integration => <div key={integration.id} className="flex items-center justify-between text-xs">
                                  <span className="truncate">{integration.name}</span>
                                  {getStatusBadge(integration.status)}
                                </div>)}
                              {formIntegrations.length > 3 && <div className="text-xs text-muted-foreground">
                                  +{formIntegrations.length - 3} more
                                </div>}
                            </div>
                          </div>}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button asChild className="flex-1" variant={formIntegrations.length === 0 ? "default" : "outline"}>
                          <Link to={`/forms/${form.id}/integrations`}>
                            <Settings className="h-4 w-4 mr-2" />
                            {formIntegrations.length === 0 ? "Add Integrations" : "Manage"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>;
        })}
          </div>}
      </div>
    </div>;
}