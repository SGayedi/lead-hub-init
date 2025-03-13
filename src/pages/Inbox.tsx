
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import { useOutlookEmails } from "@/hooks/useOutlookEmails";
import { useOutlookAuth } from "@/hooks/useOutlookAuth";
import { supabase } from "@/integrations/supabase/client";
import { EmailTabs } from "@/components/emails/EmailTabs";
import { EmailToolbar } from "@/components/emails/EmailToolbar";
import { EmailsList } from "@/components/emails/EmailsList";
import { EmailPagination } from "@/components/emails/EmailPagination";
import { OutlookConnectionStatus } from "@/components/emails/OutlookConnectionStatus";
import { ConfigWarning } from "@/components/emails/ConfigWarning";

export default function Inbox() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "inbox";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOutlookConnected, setIsOutlookConnected] = useState<boolean | null>(null);
  const [isConfigComplete, setIsConfigComplete] = useState<boolean>(true);
  const itemsPerPage = 10;
  
  // Use our custom hooks
  const { emails, isLoading, error, syncEmails, fetchEmails, authorizeOutlook } = useOutlookEmails();
  
  // Process Outlook OAuth callback if needed - moved to the top level
  useOutlookAuth();
  
  // Check if Outlook is connected
  useEffect(() => {
    async function checkOutlookConnection() {
      try {
        const { data, error } = await supabase.functions.invoke('check-outlook-connection');
        if (error) throw error;
        setIsOutlookConnected(data?.connected || false);
        setIsConfigComplete(data?.configurationComplete || false);
      } catch (err) {
        console.error("Error checking Outlook connection:", err);
        setIsOutlookConnected(false);
      }
    }
    
    checkOutlookConnection();
  }, []);
  
  // Load emails when the component mounts or tab changes
  useEffect(() => {
    // Only fetch emails if Outlook is connected
    if (isOutlookConnected) {
      fetchEmails(activeTab);
    }
  }, [activeTab, fetchEmails, isOutlookConnected]);

  // Update the active tab when the URL changes
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);
  
  // Update the URL when the tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(emails.length / itemsPerPage);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Email</h1>
        <EmailToolbar 
          syncEmails={syncEmails} 
          authorizeOutlook={authorizeOutlook}
          isLoading={isLoading}
          isOutlookConnected={isOutlookConnected}
          isConfigComplete={isConfigComplete}
        />
      </div>

      <ConfigWarning isConfigComplete={isConfigComplete} />

      <EmailTabs activeTab={activeTab} onTabChange={handleTabChange} />

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
    </div>
  );
}
