
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminHeader } from "./admin/AdminHeader";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile header */}
      {isMobile && (
        <AdminHeader 
          isMobile={isMobile} 
          toggleMobileMenu={toggleMobileMenu} 
        />
      )}

      {/* Sidebar */}
      <AdminSidebar 
        collapsed={collapsed} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile} 
        toggleMobileMenu={toggleMobileMenu}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Main content */}
      <div 
        className={cn(
          "flex-1 flex flex-col overflow-hidden",
          isMobile && "pt-14"
        )}
      >
        {!isMobile && (
          <AdminHeader 
            isMobile={isMobile} 
            toggleMobileMenu={toggleMobileMenu} 
          />
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
