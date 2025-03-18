
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { SystemInfoCards } from "@/components/admin/SystemInfoCards";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth();
  const { stats, loading, error, lastRefreshTime, refreshStats } = useAdminDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your CRM system and key metrics
          </p>
        </div>
        <Button
          onClick={refreshStats}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="font-medium">Error loading dashboard</h3>
          <p>{error}</p>
          <button 
            onClick={refreshStats}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      <DashboardStats 
        stats={stats} 
        loading={loading} 
      />

      <SystemInfoCards 
        loading={loading}
        lastRefreshTime={lastRefreshTime}
      />
    </div>
  );
}
