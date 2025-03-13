
import React from "react";
import { Mail, Send, Archive, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function EmailTabs({ activeTab, onTabChange }: EmailTabsProps) {
  return (
    <Tabs defaultValue="inbox" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 w-full max-w-md">
        <TabsTrigger value="inbox" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Inbox</span>
        </TabsTrigger>
        <TabsTrigger value="drafts" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Drafts</span>
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Sent</span>
        </TabsTrigger>
        <TabsTrigger value="archive" className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          <span className="hidden sm:inline">Archive</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
