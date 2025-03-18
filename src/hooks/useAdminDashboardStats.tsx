
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardStat, mapStatsToUI } from "@/components/admin/DashboardStats";

interface StatData {
  name: string;
  value: number;
  description: string;
  category: string;
}

export function useAdminDashboardStats() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>(new Date().toLocaleTimeString());

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
      
      const mappedStats = mapStatsToUI(data);
      setStats(mappedStats);
      setLastRefreshTime(new Date().toLocaleTimeString());
      
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminDashboard hook initialized');
    fetchDashboardStats();
    
    // Set up interval to refresh stats every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard stats...');
      fetchDashboardStats();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return {
    stats,
    loading, 
    error,
    lastRefreshTime,
    refreshStats: fetchDashboardStats
  };
}
