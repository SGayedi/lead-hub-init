
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemInfoCardsProps {
  loading: boolean;
  lastRefreshTime: string;
}

export function SystemInfoCards({ loading, lastRefreshTime }: SystemInfoCardsProps) {
  return (
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
                <span className="text-sm font-medium text-green-500">{lastRefreshTime}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
