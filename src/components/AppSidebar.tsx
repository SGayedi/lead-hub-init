import { Home, Users, Settings, Calendar, Briefcase, Inbox, Mail, Send, Archive, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/",
  },
  {
    title: "Leads",
    icon: Users,
    path: "/leads",
  },
  {
    title: "Opportunities",
    icon: Briefcase,
    path: "/opportunities",
  },
  {
    title: "Outlook",
    icon: Inbox,
    path: "/inbox",
    submenu: [
      {
        title: "Inbox",
        icon: Mail,
        path: "/inbox?tab=inbox",
      },
      {
        title: "Drafts",
        icon: FileText,
        path: "/inbox?tab=drafts",
      },
      {
        title: "Sent",
        icon: Send,
        path: "/inbox?tab=sent",
      },
      {
        title: "Archive",
        icon: Archive,
        path: "/inbox?tab=archive",
      },
    ],
  },
  {
    title: "Calendar",
    icon: Calendar,
    path: "/calendar",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Outlook: true,
  });

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isMenuActive = (item: { path: string; submenu?: any[] }) => {
    if (item.submenu) {
      return item.submenu.some(subItem => location.pathname + location.search === subItem.path);
    }
    return location.pathname === item.path;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.submenu ? (
                    <Accordion 
                      type="single" 
                      collapsible 
                      value={expandedMenus[item.title] ? item.title : ""} 
                      onValueChange={(val) => setExpandedMenus(prev => ({
                        ...prev,
                        [item.title]: val === item.title
                      }))}
                      className="w-full border-none"
                    >
                      <AccordionItem value={item.title} className="border-none">
                        <SidebarMenuButton 
                          asChild 
                          isActive={isMenuActive(item)}
                          className="w-full"
                        >
                          <AccordionTrigger className="w-full py-0 hover:no-underline">
                            <div className="flex items-center gap-2 w-full">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                          </AccordionTrigger>
                        </SidebarMenuButton>
                        
                        <AccordionContent className="pt-1 pb-0 px-0">
                          <SidebarMenuSub>
                            {item.submenu.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  isActive={location.pathname + location.search === subItem.path}
                                  onClick={() => navigate(subItem.path)}
                                  className="flex items-center gap-2"
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                    >
                      <button className="w-full flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
