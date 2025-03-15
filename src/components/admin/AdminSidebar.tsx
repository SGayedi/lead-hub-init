
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Users, Settings, Database, Mail, 
  LogOut, ChevronLeft, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminSidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  toggleMobileMenu: () => void;
  mobileMenuOpen?: boolean;
}

// Navigation items for the sidebar
const navItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/admin/dashboard",
  },
  {
    name: "User Management",
    icon: <Users className="h-5 w-5" />,
    path: "/admin/users",
  },
  {
    name: "System Settings",
    icon: <Settings className="h-5 w-5" />,
    path: "/admin/settings",
  },
  {
    name: "Data Management",
    icon: <Database className="h-5 w-5" />,
    path: "/admin/data",
  },
  {
    name: "Email Templates",
    icon: <Mail className="h-5 w-5" />,
    path: "/admin/emails",
  },
];

export function AdminSidebar({ 
  collapsed, 
  toggleSidebar, 
  isMobile, 
  toggleMobileMenu,
  mobileMenuOpen 
}: AdminSidebarProps) {
  const { adminSignOut } = useAdminAuth();

  const handleSignOut = async () => {
    await adminSignOut();
  };

  return (
    <div 
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64",
        isMobile && "fixed top-0 left-0 z-40 h-full",
        isMobile && !mobileMenuOpen && "hidden"
      )}
    >
      <div className="flex items-center justify-between p-4 h-14 border-b border-border">
        {!collapsed && (
          <div className="font-semibold text-lg">Admin Portal</div>
        )}
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="ml-auto">
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn(!collapsed && "ml-auto")}>
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-0.5 px-3">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center h-10 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                        collapsed ? "justify-center" : "justify-start"
                      )
                    }
                    onClick={isMobile ? toggleMobileMenu : undefined}
                  >
                    <span className="flex items-center">
                      {item.icon}
                    </span>
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.name}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full flex items-center text-sm font-medium", 
                  collapsed ? "justify-center" : "justify-start"
                )} 
                onClick={handleSignOut}
              >
                <span className="flex items-center">
                  <LogOut className="h-5 w-5" />
                </span>
                {!collapsed && <span className="ml-3">Sign Out</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Sign Out</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
