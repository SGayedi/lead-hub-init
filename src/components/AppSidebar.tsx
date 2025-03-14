
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Briefcase, Calendar, Mail, CheckSquare, Kanban, Settings, Plus, ListChecks } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const getSidebarItemClass = (isActive: boolean) => {
  return `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-accent-foreground ${
    isActive ? 'bg-secondary text-accent-foreground' : 'text-muted-foreground'
  }`;
};

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  
  return (
    <div className="hidden lg:block flex-col space-y-6 border-r bg-background/95 px-2 py-4 backdrop-blur-[4px]">
      <div className="flex flex-col space-y-1">
        <div className="pl-3.5 font-medium tracking-tight">
          CRM
        </div>
        <div className="flex items-center pl-3.5 space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.email ? `https://avatar.vercel.sh/${user.email}` : ""} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto w-auto text-sm font-medium hover:underline">
                {user?.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <nav className="grid items-start px-3 py-2 lg:px-4">
        <Link to="/" className={getSidebarItemClass(pathname === '/')}>
          <Home className="h-5 w-5 mr-3" />
          Dashboard
        </Link>
        
        <Link to="/leads" className={getSidebarItemClass(pathname === '/leads')}>
          <Users className="h-5 w-5 mr-3" />
          Leads
        </Link>
        
        <Link to="/opportunities" className={getSidebarItemClass(pathname === '/opportunities')}>
          <Briefcase className="h-5 w-5 mr-3" />
          Opportunities
        </Link>
        
        <Link to="/pipeline" className={getSidebarItemClass(pathname === '/pipeline')}>
          <Kanban className="h-5 w-5 mr-3" />
          Pipeline
        </Link>
        
        <Link to="/inbox" className={getSidebarItemClass(pathname === '/inbox')}>
          <Mail className="h-5 w-5 mr-3" />
          Inbox
        </Link>
        
        <Link to="/calendar" className={getSidebarItemClass(pathname === '/calendar')}>
          <Calendar className="h-5 w-5 mr-3" />
          Calendar
        </Link>
        
        <Link to="/tasks" className={getSidebarItemClass(pathname === '/tasks')}>
          <CheckSquare className="h-5 w-5 mr-3" />
          Tasks
        </Link>
        
        <Link to="/meetings" className={getSidebarItemClass(pathname === '/meetings')}>
          <ListChecks className="h-5 w-5 mr-3" />
          Meetings
        </Link>
      </nav>
      
      <div className="mt-auto px-3 py-2 lg:px-4">
        <ModeToggle />
      </div>
    </div>
  );
}
