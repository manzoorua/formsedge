import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, TrendingUp, Users, Eye, Clock, 
  BarChart3, PieChart, Activity, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { FieldAnalytics } from '@/components/analytics/FieldAnalytics';
import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector';
import ThemeToggle from '@/components/ThemeToggle';

interface Form {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  owner_id: string;
}

interface AnalyticsData {
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  conversionRate: number;
  avgCompletionTime: number;
  dropOffRate: number;
  responsesByDate: Array<{ date: string; responses: number; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  locationData: Array<{ country: string; count: number }>;
}

const FormAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    if (user && id) {
      fetchFormAnalytics();
    }
  }, [user, id, timeRange]);

  const fetchFormAnalytics = async () => {
    try {
      // Check if user can access this form
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('id, title, description, created_at, owner_id')
        .eq('id', id)
        .single();

      if (formError) throw formError;

      // Check access permissions
      const { data: hasAccess } = await supabase
        .rpc('can_access_form', { form_id: id, user_id: user?.id });

      if (!hasAccess) {
        toast({
          title: "Access denied",
          description: "You don't have permission to view this form's analytics",
          variant: "destructive",
        });
        return;
      }

      setForm(formData);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('form_analytics')
        .select('*')
        .eq('form_id', id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (analyticsError) throw analyticsError;

      // Fetch responses for completion calculations
      const { data: responsesData } = await supabase
        .from('form_responses')
        .select('created_at, submitted_at, is_partial')
        .eq('form_id', id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Process analytics data
      const totalViews = analyticsData?.reduce((sum, day) => sum + (day.views || 0), 0) || 0;
      const totalStarts = analyticsData?.reduce((sum, day) => sum + (day.starts || 0), 0) || 0;
      const totalCompletions = analyticsData?.reduce((sum, day) => sum + (day.completions || 0), 0) || 0;
      
      const conversionRate = totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0;
      const dropOffRate = totalStarts > 0 ? ((totalStarts - totalCompletions) / totalStarts) * 100 : 0;
      
      // Calculate average completion time
      const completedResponses = responsesData?.filter(r => !r.is_partial && r.submitted_at) || [];
      const avgCompletionTime = completedResponses.length > 0 
        ? completedResponses.reduce((sum, r) => {
            const start = new Date(r.created_at).getTime();
            const end = new Date(r.submitted_at!).getTime();
            return sum + (end - start);
          }, 0) / completedResponses.length / 1000 / 60 // Convert to minutes
        : 0;

      // Prepare chart data
      const responsesByDate = analyticsData?.map(day => ({
        date: day.date,
        responses: day.completions || 0,
        views: day.views || 0
      })) || [];

      // Mock device and location data (would come from actual tracking)
      const deviceBreakdown = [
        { device: 'Desktop', count: Math.floor(totalViews * 0.6) },
        { device: 'Mobile', count: Math.floor(totalViews * 0.35) },
        { device: 'Tablet', count: Math.floor(totalViews * 0.05) }
      ];

      const locationData = [
        { country: 'United States', count: Math.floor(totalViews * 0.4) },
        { country: 'United Kingdom', count: Math.floor(totalViews * 0.2) },
        { country: 'Canada', count: Math.floor(totalViews * 0.15) },
        { country: 'Australia', count: Math.floor(totalViews * 0.1) },
        { country: 'Others', count: Math.floor(totalViews * 0.15) }
      ];

      setAnalytics({
        totalViews,
        totalStarts,
        totalCompletions,
        conversionRate,
        avgCompletionTime,
        dropOffRate,
        responsesByDate,
        deviceBreakdown,
        locationData
      });

    } catch (error: any) {
      toast({
        title: "Error loading analytics",
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

  if (!form || !analytics) {
    return <Navigate to="/dashboard" replace />;
  }

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
              <p className="text-sm text-muted-foreground">Analytics Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <Button variant="outline" asChild>
              <Link to={`/forms/${id}/responses`}>
                <Users className="h-4 w-4 mr-2" />
                Responses
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Form page visits
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Starts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalStarts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Users who started filling
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{analytics.totalCompletions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Successful submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Starts to completions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgCompletionTime.toFixed(1)}m</div>
              <p className="text-xs text-muted-foreground">
                Average time to complete
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drop-off Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{analytics.dropOffRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Users who didn't complete
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Score</CardTitle>
              <Badge className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.max(0, Math.min(100, Math.round(analytics.conversionRate * 2))).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Performance score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="fields">Field Analysis</TabsTrigger>
            <TabsTrigger value="devices">Devices & Location</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <AnalyticsCharts 
              responsesByDate={analytics.responsesByDate}
              conversionRate={analytics.conversionRate}
              timeRange={timeRange}
            />
          </TabsContent>
          
          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-4">Views vs Responses</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Views</span>
                          <span className="text-sm font-medium">{analytics.totalViews}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Form Starts</span>
                          <span className="text-sm font-medium">{analytics.totalStarts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Completions</span>
                          <span className="text-sm font-medium">{analytics.totalCompletions}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-4">Conversion Funnel</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Views</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="w-full h-full bg-primary"></div>
                            </div>
                            <span className="text-sm">100%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Starts</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${analytics.totalViews > 0 ? (analytics.totalStarts / analytics.totalViews) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">
                              {analytics.totalViews > 0 ? ((analytics.totalStarts / analytics.totalViews) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Completions</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-success" 
                                style={{ width: `${analytics.conversionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{analytics.conversionRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fields">
            <FieldAnalytics formId={id!} />
          </TabsContent>
          
          <TabsContent value="devices">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.deviceBreakdown.map((device) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <span className="text-sm">{device.device}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${analytics.totalViews > 0 ? (device.count / analytics.totalViews) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{device.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.locationData.map((location) => (
                      <div key={location.country} className="flex items-center justify-between">
                        <span className="text-sm">{location.country}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent" 
                              style={{ width: `${analytics.totalViews > 0 ? (location.count / analytics.totalViews) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{location.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FormAnalytics;