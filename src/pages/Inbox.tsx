import React, { useState, useEffect } from "react";
import { Mail, Send, Archive, FileText, RefreshCw, LogIn, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { format } from "date-fns";
import { useOutlookEmails } from "@/hooks/useOutlookEmails";
import { useOutlookAuth } from "@/hooks/useOutlookAuth";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const paginatedEmails = emails.slice(startIndex, endIndex);
  const totalPages = Math.ceil(emails.length / itemsPerPage);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Email</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncEmails} disabled={isLoading || !isOutlookConnected}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Emails
          </Button>
          <Button variant="outline" onClick={authorizeOutlook} disabled={!isConfigComplete}>
            <LogIn className="mr-2 h-4 w-4" />
            Connect Outlook
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Compose
          </Button>
        </div>
      </div>

      {!isConfigComplete && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Microsoft OAuth configuration is incomplete. Please check the Edge Function environment variables.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="inbox" value={activeTab} onValueChange={handleTabChange} className="w-full">
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

        <div className="mt-6">
          {isOutlookConnected === null ? (
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <p className="text-muted-foreground flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking connection status...
                </p>
              </CardContent>
            </Card>
          ) : !isOutlookConnected ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-muted-foreground">No Outlook Account Connected</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6 space-y-4">
                <Mail className="h-24 w-24 text-muted-foreground/30" />
                <p className="text-center text-muted-foreground">
                  Connect your Outlook account to view and manage your emails.
                </p>
                <Button onClick={authorizeOutlook} disabled={!isConfigComplete}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Connect Outlook
                  {!isConfigComplete && <span className="ml-2">(Configuration Required)</span>}
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <p className="text-muted-foreground flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading emails...
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-6">
                <p className="text-center text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : emails.length === 0 ? (
            <EmptyInboxState 
              message={
                activeTab === "inbox" ? "Your inbox is empty" :
                activeTab === "drafts" ? "No drafts found" :
                activeTab === "sent" ? "No sent messages" :
                "No archived messages"
              } 
            />
          ) : (
            <Card>
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
                      <TableRow 
                        key={email.id} 
                        className={`cursor-pointer ${!email.read ? 'font-medium' : ''}`}
                      >
                        <TableCell className="font-medium">{email.sender_name}</TableCell>
                        <TableCell>{email.subject}</TableCell>
                        <TableCell className="text-right">
                          {format(new Date(email.received_at), 'MMM d')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {emails.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
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
