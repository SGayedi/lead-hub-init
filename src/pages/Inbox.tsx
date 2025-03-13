
import React, { useState, useEffect } from "react";
import { Mail, Send, Archive, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

export default function Inbox() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "inbox";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Update the active tab when the URL changes
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Helper function to get a friendly display name for the tab
  const getTabDisplayName = (tab: string) => {
    const firstLetter = tab.charAt(0).toUpperCase();
    const restOfWord = tab.slice(1);
    return firstLetter + restOfWord;
  };

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "inbox":
        return <EmptyInboxState message="Your inbox is empty" />;
      case "drafts":
        return <EmptyInboxState message="No drafts found" />;
      case "sent":
        return <EmptyInboxState message="No sent messages" />;
      case "archive":
        return <EmptyInboxState message="No archived messages" />;
      default:
        return <EmptyInboxState message="Your inbox is empty" />;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{getTabDisplayName(activeTab)}</h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      <div className="space-y-4">
        {renderContent()}
      </div>
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
