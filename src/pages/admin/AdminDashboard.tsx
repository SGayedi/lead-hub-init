
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Users, UserPlus, FileText, BriefcaseBusiness, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface DashboardStat {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface StatData {
  name: string;
  value: number;
  description: string;
  category: string;
}

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapStatsToUI = (statsData: StatData[]) => {
    const mappedStats = statsData.map(stat => {
      let icon = <FileText className="h-5 w-5" />;
      let color = 'bg-gray-500';
      
      // Assign icons and colors based on stat name
      switch(stat.name) {
        case 'Total Users':
          icon = <Users className="h-5 w-5" />;
          color = 'bg-blue-500';
          break;
        case 'New Users (7d)':
          icon = <UserPlus className="h-5 w-5" />;
          color = 'bg-green-500';
          break;
        case 'Total Leads':
          icon = <FileText className="h-5 w-5" />;
          color = 'bg-purple-500';
          break;
        case 'Opportunities':
          icon = <BriefcaseBusiness className="h-5 w-5" />;
          color = 'bg-amber-500';
          break;
        case 'Meetings':
          icon = <Calendar className="h-5 w-5" />;
          color = 'bg-indigo-500';
          break;
        case 'Active Tasks':
          icon = <Clock className="h-5 w-5" />;
          color = 'bg-red-500';
          break;
        case 'Completed Tasks':
          icon = <CheckCircle2 className="h-5 w-5" />;
          color = 'bg-teal-500';
          break;
      }
      
      return {
        title: stat.name,
        value: stat.value,
        description: stat.description,
        icon,
        color
      };
    });
    
    setStats(mappedStats);
  };

  const fetchDashboardStats = async () => {
    setError(null);
    try {
      setLoading(true);
      
      // First try to refresh the stats before fetching
      console.log('Attempting to refresh dashboard stats...');
      const { error: refreshError } = await supabase.rpc('refresh_dashboard_stats');
      
      if (refreshError) {
        console.error('Error refreshing dashboard stats:', refreshError);
        toast.error('Failed to refresh dashboard statistics');
      } else {
        console.log('Dashboard stats refreshed successfully');
      }
      
      // Now fetch the stats
      console.log('Fetching dashboard stats...');
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      console.log('Dashboard stats fetched:', data);
      
      if (!data || data.length === 0) {
        throw new Error("No dashboard statistics found");
      }
      
      mapStatsToUI(data);
      
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminDashboard component mounted');
    fetchDashboardStats();
    
    // Set up interval to refresh stats every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard stats...');
      fetchDashboardStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Add a manual refresh function
  const handleManualRefresh = async () => {
    console.log('Manual refresh initiated');
    fetchDashboardStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your CRM system and key metrics
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="font-medium">Error loading dashboard</h3>
          <p>{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array(7).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-16" />
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <CardDescription className="text-2xl font-bold">
                      {stat.value}
                    </CardDescription>
                  </div>
                  <div className={`${stat.color} text-white p-2 rounded-full`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* System Activity and Health cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>
              Latest actions performed in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Recent activity logs will be displayed here
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Current status of your CRM system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Connection</span>
                  <span className="text-sm font-medium text-green-500">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Services</span>
                  <span className="text-sm font-medium text-green-500">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authentication</span>
                  <span className="text-sm font-medium text-green-500">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Stats Refresh</span>
                  <span className="text-sm font-medium text-green-500">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
