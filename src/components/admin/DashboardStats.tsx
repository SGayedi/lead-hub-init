
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, FileText, BriefcaseBusiness, Calendar, CheckCircle2, Clock } from "lucide-react";

export interface DashboardStat {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface DashboardStatsProps {
  stats: DashboardStat[];
  loading: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  return (
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
  );
}

export function mapStatsToUI(statsData: {
  name: string;
  value: number;
  description: string;
  category: string;
}[]) {
  return statsData.map(stat => {
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
}
