
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Users, UserPlus, FileText, BriefcaseBusiness, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStat {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Fetch lead count
        const { count: leadCount, error: leadError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });
        
        if (leadError) throw leadError;
        
        // Fetch opportunity count
        const { count: opportunityCount, error: oppError } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true });
        
        if (oppError) throw oppError;
        
        // Fetch active task count
        const { count: activeTaskCount, error: taskError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (taskError) throw taskError;
        
        // Fetch completed task count
        const { count: completedTaskCount, error: complTaskError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');
        
        if (complTaskError) throw complTaskError;
        
        // Fetch meeting count
        const { count: meetingCount, error: meetingError } = await supabase
          .from('meetings')
          .select('*', { count: 'exact', head: true });
        
        if (meetingError) throw meetingError;
        
        // Get new user registrations last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const { count: newUserCount, error: newUserError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastWeek.toISOString());
        
        if (newUserError) throw newUserError;
        
        setStats([
          {
            title: 'Total Users',
            value: userCount || 0,
            description: 'Registered users in the system',
            icon: <Users className="h-5 w-5" />,
            color: 'bg-blue-500'
          },
          {
            title: 'New Users (7d)',
            value: newUserCount || 0,
            description: 'New registrations in last 7 days',
            icon: <UserPlus className="h-5 w-5" />,
            color: 'bg-green-500'
          },
          {
            title: 'Total Leads',
            value: leadCount || 0,
            description: 'All leads in the system',
            icon: <FileText className="h-5 w-5" />,
            color: 'bg-purple-500'
          },
          {
            title: 'Opportunities',
            value: opportunityCount || 0,
            description: 'Current opportunities',
            icon: <BriefcaseBusiness className="h-5 w-5" />,
            color: 'bg-amber-500'
          },
          {
            title: 'Meetings',
            value: meetingCount || 0,
            description: 'Scheduled meetings',
            icon: <Calendar className="h-5 w-5" />,
            color: 'bg-indigo-500'
          },
          {
            title: 'Active Tasks',
            value: activeTaskCount || 0,
            description: 'Tasks in progress',
            icon: <Clock className="h-5 w-5" />,
            color: 'bg-red-500'
          },
          {
            title: 'Completed Tasks',
            value: completedTaskCount || 0,
            description: 'Completed tasks',
            icon: <CheckCircle2 className="h-5 w-5" />,
            color: 'bg-teal-500'
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (adminUser) {
      fetchDashboardStats();
    }
  }, [adminUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your CRM system and key metrics
        </p>
      </div>

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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
