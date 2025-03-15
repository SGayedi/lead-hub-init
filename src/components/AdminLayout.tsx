import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { 
  LayoutDashboard, Users, Settings, Database, Mail, 
  LogOut, ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdminLayout() {
  const { adminUser, adminSignOut } = useAdminAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await adminSignOut();
  };

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

  const renderSidebar = () => (
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
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                      collapsed && "justify-center"
                    )
                  }
                  onClick={isMobile ? toggleMobileMenu : undefined}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.name}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full flex items-center", 
                collapsed && "justify-center"
              )} 
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Sign Out</TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="ml-2 font-semibold">Admin Portal</span>
          </div>
          <ModeToggle />
        </div>
      )}

      {/* Sidebar */}
      {renderSidebar()}

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
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
            <div className="font-semibold">
              {adminUser?.fullName ? `Welcome, ${adminUser.fullName}` : adminUser?.email}
            </div>
            <ModeToggle />
          </header>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
