import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, FileText, Settings, LogOut, BarChart3, TestTube, Shield, Zap, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormContextMenu } from '@/components/FormContextMenu';
import { GlobalSettingsDialog } from '@/components/GlobalSettingsDialog';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdmin } from '@/hooks/useAdmin';
import { AnimatedProfileButton } from '@/components/AnimatedProfileButton';
import { Form } from '@/types/form';
import ThemeToggle from '@/components/ThemeToggle';
import { TemplateSelectionModal } from '@/components/templates/TemplateSelectionModal';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  avatar_url?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const { currentTier, limits, isWithinLimit } = useSubscription(isAdmin);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch user's owned forms
      const { data: ownedFormsData, error: ownedError } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', user?.id)
        .order('updated_at', { ascending: false });

      if (ownedError) {
        throw ownedError;
      }

      // Fetch forms shared with user via team_members
      const { data: sharedFormsData } = await supabase
        .from('team_members')
        .select(`
          role,
          forms!inner(*)
        `)
        .eq('user_id', user?.id)
        .not('accepted_at', 'is', null);

      // Extract shared forms and mark them
      const sharedForms = (sharedFormsData || [])
        .map((tm: any) => ({
          ...tm.forms,
          _shared: true,
          _sharedRole: tm.role,
        }))
        .filter((form: any) => form.owner_id !== user?.id); // Exclude owned forms

      // Combine and deduplicate forms
      const allFormsData = [...(ownedFormsData || []), ...sharedForms];
      
      // Normalize form data types
      const normalizedForms = allFormsData.map(form => ({
        ...form,
        url_params_config: (form.url_params_config as unknown as any) || undefined,
        layout: (form.layout as any) || {
          columns: 1,
          grid_gap: 'md',
          responsive: true,
        },
      })) as Form[];
      
      setForms(normalizedForms);
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  const handleFormUpdate = (updatedForm: Form) => {
    setForms(prevForms => 
      prevForms.map(form => 
        form.id === updatedForm.id ? updatedForm : form
      )
    );
  };

  const handleFormDelete = (formId: string) => {
    setForms(prevForms => prevForms.filter(form => form.id !== formId));
  };

  const handleFormDuplicate = (newForm: Form) => {
    setForms(prevForms => [newForm, ...prevForms]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-success';
      case 'draft': return 'bg-warning';
      case 'archived': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl text-foreground">FormsEdge</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Badge variant={isAdmin ? "default" : "secondary"} className="capitalize font-medium">
              {isAdmin ? "Admin" : `${currentTier} plan`}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Link to="/docs">
                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                Tutorial
              </Link>
            </Button>
            <Button 
              asChild
              className="bg-gradient-primary hover:opacity-90 text-white shadow-primary"
              size="sm"
            >
              <Link to="/dashboard/integrations">
                <Zap className="h-4 w-4 mr-2" />
                Integrations
              </Link>
            </Button>
            {isAdmin ? (
              <Button
                asChild
                className="bg-gradient-primary hover:opacity-90 text-white shadow-primary"
                size="sm"
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
            ) : currentTier === 'free' && (
              <Button
                onClick={() => setUpgradeModalOpen(true)}
                className="bg-gradient-primary hover:opacity-90 text-white shadow-primary"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Go PRO
              </Button>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-foreground">Hi</h2>
            <AnimatedProfileButton 
              firstName={profile?.first_name || 'User'}
              avatarUrl={profile?.avatar_url}
            />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Create and manage your forms here. <span className="font-medium text-primary">Click on your name to Refer & Earn!</span>
          </p>
        </div>


        {/* Forms Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your Forms</h2>
              {!isAdmin && currentTier === 'free' && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {forms.length}/{limits.maxForms} forms used
                </p>
              )}
            </div>
            {isWithinLimit(forms.length, 'forms') ? (
              <Button 
                className="shadow-primary bg-gradient-primary text-white" 
                onClick={() => setTemplateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Form
              </Button>
            ) : (
              <Button
                onClick={() => setUpgradeModalOpen(true)}
                className="bg-gradient-primary hover:opacity-90 text-white shadow-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upgrade to Create More
              </Button>
            )}
          </div>

          {forms.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-foreground mx-auto mb-4" />
                <CardTitle className="mb-2 font-bold">No forms yet</CardTitle>
                <CardDescription className="mb-4 text-slate-600 dark:text-slate-300">
                  Create your first form to get started with collecting responses
                </CardDescription>
                <Button 
                  className="shadow-primary bg-gradient-primary text-white" 
                  onClick={() => setTemplateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Form
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form, index) => {
                // Cycle through different gradient backgrounds for visual appeal
                const gradientClasses = [
                  'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/50 dark:to-violet-800/50 border-purple-200 dark:border-purple-700',
                  'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-800/50 border-teal-200 dark:border-teal-700', 
                  'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-800/50 border-blue-200 dark:border-blue-700',
                  'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/50 dark:to-emerald-800/50 border-green-200 dark:border-green-700',
                  'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/50 dark:to-amber-800/50 border-orange-200 dark:border-orange-700'
                ];
                const gradientClass = gradientClasses[index % gradientClasses.length];
                
                return (
                  <Card key={form.id} className={`${gradientClass} hover:shadow-hover transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-2`}>
                    <CardHeader className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={`${getStatusColor(form.status)} text-white capitalize shadow-sm font-bold`}
                          >
                            {form.status}
                          </Badge>
                          {(form as any)._shared && (
                            <Badge variant="outline" className="text-xs font-medium capitalize">
                              {(form as any)._sharedRole || 'Shared'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {new Date(form.created_at).toLocaleDateString()}
                          </span>
                          {!(form as any)._shared && (
                            <FormContextMenu
                              form={form}
                              onFormUpdate={handleFormUpdate}
                              onFormDelete={handleFormDelete}
                              onFormDuplicate={handleFormDuplicate}
                            />
                          )}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-1 text-foreground font-bold">{form.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-300">
                        {form.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="bg-background/60 dark:bg-background/80 backdrop-blur-sm rounded-lg m-3 mt-0">
                      <div className="flex items-center justify-between text-sm text-foreground mb-4 font-medium">
                        <span>0 responses</span>
                        <span>0 views</span>
                      </div>
                      <Separator className="mb-4" />
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" className="flex-1 font-medium" asChild>
                          <Link to={`/forms/${form.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1 font-medium"
                          disabled={form.status !== 'published'}
                          asChild={form.status === 'published'}
                        >
                          {form.status === 'published' ? (
                            <Link to={`/forms/${form.id}/embed`}>
                              <TestTube className="h-4 w-4 mr-1" />
                              Test
                            </Link>
                          ) : (
                            <span className="opacity-50">
                              <TestTube className="h-4 w-4 mr-1" />
                              Test
                            </span>
                          )}
                        </Button>
                        <Button variant="secondary" size="sm" className="flex-1 font-medium" asChild>
                          <Link to={`/forms/${form.id}/responses`}>
                            Responses
                          </Link>
                        </Button>
                        <Button variant="secondary" size="sm" className="font-medium" asChild>
                          <Link to={`/forms/${form.id}/analytics`}>
                            <BarChart3 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <GlobalSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        profile={profile}
        onProfileUpdate={setProfile}
      />
      
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
      
      <TemplateSelectionModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
