
// Import any components you need here
import React from "react";
import { OutlookEmail } from "@/hooks/useOutlookEmails";
import { EmailsList } from "./EmailsList";
import { OutlookConnectionStatus } from "./OutlookConnectionStatus";
import { EmptyInboxState } from "./EmptyInboxState";
import { Skeleton } from "@/components/ui/skeleton";

export interface EmailContentProps {
  emails: OutlookEmail[];
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  authorizeOutlook: () => void;
  authUrl: string | null;
  resetAuthUrl: () => void;
  authError?: string | null;
}

export function EmailContent({
  emails,
  isLoading,
  error,
  activeTab,
  currentPage,
  setCurrentPage,
  isOutlookConnected,
  isConfigComplete,
  authorizeOutlook,
  authUrl,
  resetAuthUrl,
  authError
}: EmailContentProps) {
  
  // Show connection status if not connected
  if (isOutlookConnected === false) {
    return (
      <OutlookConnectionStatus 
        isOutlookConnected={isOutlookConnected}
        isConfigComplete={isConfigComplete}
        authorizeOutlook={authorizeOutlook}
        authUrl={authUrl}
        resetAuthUrl={resetAuthUrl}
        authError={authError}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-card border-border p-6 rounded-md text-center text-red-500">
        <p>Error loading emails: {error}</p>
      </div>
    );
  }

  // Show empty state if no emails
  if (!emails || emails.length === 0) {
    return <EmptyInboxState activeTab={activeTab} />;
  }

  // Show emails list
  return (
    <EmailsList 
      emails={emails} 
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );
}
