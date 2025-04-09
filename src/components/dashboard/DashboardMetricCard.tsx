
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  linkText: string;
  loading: boolean;
}

interface DashboardMetricCardProps {
  metric: MetricProps;
  className?: string;
}

export function DashboardMetricCard({ metric, className }: DashboardMetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-1">
        <div 
          className={cn(
            "rounded-t-md flex items-center justify-between px-4 py-2 text-white", 
            metric.color
          )}
        >
          <h3 className="font-medium">{metric.title}</h3>
          <div className="p-1 bg-white/20 rounded-full">
            {metric.icon}
          </div>
        </div>
        <CardContent className="p-4">
          {metric.loading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <div className="text-3xl font-bold mb-1">{metric.value}</div>
          )}
          <p className="text-xs text-muted-foreground mb-2">
            {metric.description}
          </p>
          <Link to={metric.link}>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs flex items-center"
            >
              {metric.linkText}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </div>
    </Card>
  );
}
