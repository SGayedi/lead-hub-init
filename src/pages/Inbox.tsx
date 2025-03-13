
import React, { useState } from "react";
import { Mail, Send, Archive, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [activeTab, setActiveTab] = useState("inbox");

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab} className="w-full">
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

        <TabsContent value="inbox" className="space-y-4 mt-6">
          <EmptyInboxState message="Your inbox is empty" />
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4 mt-6">
          <EmptyInboxState message="No drafts found" />
        </TabsContent>

        <TabsContent value="sent" className="space-y-4 mt-6">
          <EmptyInboxState message="No sent messages" />
        </TabsContent>

        <TabsContent value="archive" className="space-y-4 mt-6">
          <EmptyInboxState message="No archived messages" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface EmptyInboxStateProps {
  message: string;
}

function EmptyInboxState({ message }: EmptyInboxStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-muted-foreground">{message}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        <Mail className="h-24 w-24 text-muted-foreground/30" />
      </CardContent>
    </Card>
  );
}
