
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useLeads } from "@/hooks/useLeads";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useTasks } from "@/hooks/useTasks";
import { useMeetings } from "@/hooks/useMeetings";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, CheckSquare, Calendar, ArrowRight, Activity, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { DashboardActivityCard } from "@/components/dashboard/DashboardActivityCard";
import { DashboardMeetingCard } from "@/components/dashboard/DashboardMeetingCard";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { opportunities, isLoading: opportunitiesLoading } = useOpportunities();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { meetings, isLoading: meetingsLoading } = useMeetings();

  // Count tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tasksDueToday = tasks?.filter(task => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }).length || 0;

  // Count meetings for today
  const meetingsToday = meetings?.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    meetingDate.setHours(0, 0, 0, 0);
    return meetingDate.getTime() === today.getTime();
  }).length || 0;

  // Animate components on load
  useEffect(() => {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-fade-in');
      }, 100 * index);
    });
  }, []);

  // Metrics for the dashboard
  const metrics = [
    {
      title: "Total Leads",
      value: leads?.length || 0,
      description: "All leads in your pipeline",
      icon: <Users className="h-5 w-5" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      link: "/leads",
      linkText: "View Leads",
      loading: leadsLoading
    },
    {
      title: "Active Opportunities",
      value: opportunities?.length || 0,
      description: "Current business opportunities",
      icon: <Briefcase className="h-5 w-5" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      link: "/opportunities",
      linkText: "View Opportunities",
      loading: opportunitiesLoading
    },
    {
      title: "Tasks Due Today",
      value: tasksDueToday,
      description: "Tasks requiring attention today",
      icon: <CheckSquare className="h-5 w-5" />,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      link: "/tasks",
      linkText: "View Tasks",
      loading: tasksLoading
    },
    {
      title: "Meetings Today",
      value: meetingsToday,
      description: "Scheduled for today",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      link: "/meetings",
      linkText: "View Meetings",
      loading: meetingsLoading
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
              Welcome back
            </span>
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your CRM today
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="gap-2">
            <Activity size={16} />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => (
          <DashboardMetricCard 
            key={idx}
            metric={metric}
            className="dashboard-card opacity-0"
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Performance Chart */}
        <Card className="md:col-span-4 dashboard-card opacity-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Lead conversion and opportunity progress
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-500">+12.5%</span>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <DashboardChart />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-3 dashboard-card opacity-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest CRM activities</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : tasks && tasks.length > 0 ? (
              <DashboardActivityCard tasks={tasks.slice(0, 5)} />
            ) : (
              <p className="text-sm text-muted-foreground">No recent activities found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Upcoming Meetings */}
        <Card className="md:col-span-2 dashboard-card opacity-0">
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>Your scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {meetingsLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : meetings && meetings.length > 0 ? (
              <DashboardMeetingCard meetings={meetings.slice(0, 5)} />
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming meetings found.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="dashboard-card opacity-0">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Add New Lead
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckSquare className="mr-2 h-4 w-4" />
              Create Task
            </Button>
            <Button variant="outline" className="justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              New Opportunity
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
