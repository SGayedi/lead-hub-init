
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminHeaderProps {
  isMobile: boolean;
  toggleMobileMenu: () => void;
}

export function AdminHeader({ isMobile, toggleMobileMenu }: AdminHeaderProps) {
  const { adminUser } = useAdminAuth();

  // Mobile header
  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-30 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 font-semibold">Admin Portal</span>
        </div>
        <ModeToggle />
      </div>
    );
  }

  // Desktop header
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="font-semibold">
        {adminUser?.fullName ? `Welcome, ${adminUser.fullName}` : adminUser?.email}
      </div>
      <ModeToggle />
    </header>
  );
}
