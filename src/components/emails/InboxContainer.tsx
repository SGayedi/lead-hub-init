
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOutlookEmails } from "@/hooks/useOutlookEmails";
import { useOutlookAuth } from "@/hooks/useOutlookAuth";
import { EmailTabs } from "@/components/emails/EmailTabs";
import { EmailToolbar } from "@/components/emails/EmailToolbar";
import { EmailContent } from "@/components/emails/EmailContent";
import { ConfigWarning } from "@/components/emails/ConfigWarning";

export function InboxContainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "inbox";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOutlookConnected, setIsOutlookConnected] = useState<boolean | null>(null);
  const [isConfigComplete, setIsConfigComplete] = useState<boolean>(true);
  
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
  
  // Add a new effect to listen for messages from the popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OUTLOOK_AUTH_SUCCESS') {
        // Refresh connection status and emails
        setIsOutlookConnected(true);
        fetchEmails(activeTab);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTab, fetchEmails]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
    setCurrentPage(1);
  };

  return (
    <div className="container py-6 space-y-6 text-foreground bg-background">
      <InboxHeader 
        syncEmails={syncEmails}
        authorizeOutlook={authorizeOutlook}
        isLoading={isLoading}
        isOutlookConnected={isOutlookConnected}
        isConfigComplete={isConfigComplete}
        configError={configError}
      />

      <ConfigWarning isConfigComplete={isConfigComplete} configError={configError} />

      <EmailTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <EmailContent 
        emails={emails}
        isLoading={isLoading}
        error={error}
        activeTab={activeTab}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOutlookConnected={isOutlookConnected}
        isConfigComplete={isConfigComplete}
        authorizeOutlook={authorizeOutlook}
      />
    </div>
  );
}

function InboxHeader({ 
  syncEmails, 
  authorizeOutlook, 
  isLoading, 
  isOutlookConnected, 
  isConfigComplete, 
  configError 
}: {
  syncEmails: () => void;
  authorizeOutlook: () => void;
  isLoading: boolean;
  isOutlookConnected: boolean | null;
  isConfigComplete: boolean;
  configError?: string | null;
}) {
  return (
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
  );
}
