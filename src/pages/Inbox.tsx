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
  
  const { emails, isLoading, error, configError, syncEmails, fetchEmails, authorizeOutlook } = useOutlookEmails();
  
  useOutlookAuth();
  
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
  
  useEffect(() => {
    if (isOutlookConnected) {
      fetchEmails(activeTab);
    }
  }, [activeTab, fetchEmails, isOutlookConnected]);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(emails.length / itemsPerPage);

  return (
    <div className="container py-6 space-y-6 text-foreground bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Email</h1>
        <EmailToolbar 
          syncEmails={syncEmails} 
          authorizeOutlook={authorizeOutlook}
          isLoading={isLoading}
          isOutlookConnected={isOutlookConnected}
          isConfigComplete={isConfigComplete}
          configError={configError}
        />
      </div>

      <ConfigWarning isConfigComplete={isConfigComplete} configError={configError} />

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
