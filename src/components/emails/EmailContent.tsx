
import React from "react";
import { OutlookEmail } from "@/types/outlook";
import { OutlookConnectionStatus } from "@/components/emails/OutlookConnectionStatus";
import { EmailsList } from "@/components/emails/EmailsList";
import { EmailPagination } from "@/components/emails/EmailPagination";

interface EmailContentProps {
  emails: OutlookEmail[];
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  authorizeOutlook: () => void;
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
  authorizeOutlook
}: EmailContentProps) {
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(emails.length / itemsPerPage);
  
  return (
    <div className="mt-6">
      <OutlookConnectionStatus 
        isOutlookConnected={isOutlookConnected} 
        isConfigComplete={isConfigComplete}
        authorizeOutlook={authorizeOutlook}
      />

      {isOutlookConnected && (
        <>
          <EmailsList 
            emails={emails}
            isLoading={isLoading}
            error={error}
            activeTab={activeTab}
            startIndex={startIndex}
            endIndex={endIndex}
          />

          <EmailPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
