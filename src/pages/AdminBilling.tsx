import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Users, XCircle, Activity, Webhook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface BillingStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  failedPayments: number;
  subscribers: Array<{
    id: string;
    email: string;
    subscription_tier: string;
    subscription_status: string;
    subscription_end: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
    user_id: string;
  }>;
  webhookEvents: Array<{
    id: string;
    event_type: string;
    created_at: string;
    data: any;
  }>;
}

const AdminBilling = () => {
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const { toast } = useToast();

  const fetchBillingStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-billing-stats');

      if (error) {
        console.error('Error fetching billing stats:', error);
        throw error;
      }

      setStats(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load billing statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchBillingStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredSubscribers = stats?.subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchEmail.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string, cancelAtEnd: boolean) => {
    if (cancelAtEnd) {
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Canceling</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">Active</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-500/10 text-gray-500',
      pro: 'bg-blue-500/10 text-blue-500',
      enterprise: 'bg-purple-500/10 text-purple-500',
    };
    return (
      <Badge variant="outline" className={colors[tier] || 'bg-gray-500/10 text-gray-500'}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  // Generate revenue trend data (mock data for now - replace with real historical data)
  const revenueData = [
    { month: 'Jan', revenue: stats?.monthlyRecurringRevenue ? stats.monthlyRecurringRevenue * 0.7 : 0 },
    { month: 'Feb', revenue: stats?.monthlyRecurringRevenue ? stats.monthlyRecurringRevenue * 0.8 : 0 },
    { month: 'Mar', revenue: stats?.monthlyRecurringRevenue ? stats.monthlyRecurringRevenue * 0.9 : 0 },
    { month: 'Apr', revenue: stats?.monthlyRecurringRevenue || 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
          <p className="text-muted-foreground">Monitor revenue and manage subscriptions</p>
        </div>
        <Button onClick={fetchBillingStats} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="failed">Failed Payments</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.monthlyRecurringRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ARR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.annualRecurringRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Paying customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Canceled</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.canceledSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Churn this period</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly recurring revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>Manage customer subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border rounded-md"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription End</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.email}</TableCell>
                      <TableCell>{getTierBadge(sub.subscription_tier || 'free')}</TableCell>
                      <TableCell>{getStatusBadge(sub.subscription_status || 'inactive', sub.cancel_at_period_end)}</TableCell>
                      <TableCell>
                        {sub.subscription_end 
                          ? format(new Date(sub.subscription_end), 'MMM d, yyyy')
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>{format(new Date(sub.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredSubscribers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No subscriptions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payments</CardTitle>
              <CardDescription>Monitor and resolve payment issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No failed payments to display</p>
                <p className="text-sm mt-2">Failed payment tracking will appear here when configured</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Webhook Events</CardTitle>
              <CardDescription>Recent webhook events from Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No webhook events to display</p>
                <p className="text-sm mt-2">Configure webhook event logging to track Stripe events</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBilling;
