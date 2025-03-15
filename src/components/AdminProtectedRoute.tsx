
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { adminUser, adminLoading } = useAdminAuth();

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin/auth" replace />;
  }

  return <>{children}</>;
}
