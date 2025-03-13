
import React from "react";
import { RefreshCw, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyInboxState } from "./EmptyInboxState";
import { EmailRow } from "./EmailRow";
import { OutlookEmail } from "@/hooks/useOutlookEmails";

interface EmailsListProps {
  emails: OutlookEmail[];
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  startIndex: number;
  endIndex: number;
}

export function EmailsList({ 
  emails, 
  isLoading, 
  error, 
  activeTab,
  startIndex,
  endIndex
}: EmailsListProps) {
  const paginatedEmails = emails.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-muted-foreground flex items-center">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading emails...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-6">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (emails.length === 0) {
    return (
      <EmptyInboxState 
        message={
          activeTab === "inbox" ? "Your inbox is empty" :
          activeTab === "drafts" ? "No drafts found" :
          activeTab === "sent" ? "No sent messages" :
          "No archived messages"
        } 
      />
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Sender</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right w-[120px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmails.map((email) => (
              <EmailRow key={email.id} email={email} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
