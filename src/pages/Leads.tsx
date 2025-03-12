import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Clock, CheckCircle, Archive, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LeadCreationForm } from "@/components/LeadCreationForm";
import { useLeads } from "@/hooks/useLeads";
import { LeadStatus } from "@/types/crm";

export default function Leads() {
  const { leads, isLoading, approveLead, rejectLead, archiveLead } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<LeadStatus | "all">("active");
  const [createLeadOpen, setCreateLeadOpen] = useState(false);

  const getPriorityColor = (priority: Lead["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-green-500";
    }
  };

  const getStatusDetails = (status: LeadStatus) => {
    switch (status) {
      case "active":
        return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, label: "Active" };
      case "waiting_for_details":
        return { icon: <Clock className="h-4 w-4 text-amber-500" />, label: "Waiting for Details" };
      case "waiting_for_approval":
        return { icon: <AlertTriangle className="h-4 w-4 text-blue-500" />, label: "Waiting for Approval" };
      case "archived":
        return { icon: <Archive className="h-4 w-4 text-gray-500" />, label: "Archived" };
      case "rejected":
        return { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, label: "Rejected" };
    }
  };

  const handleApprove = (leadId: string) => {
    approveLead.mutate(leadId);
  };

  const handleReject = (leadId: string) => {
    rejectLead.mutate(leadId);
  };

  const handleArchive = (leadId: string) => {
    archiveLead.mutate(leadId);
  };

  const filteredLeads = leads.filter(lead => {
    if (activeTab !== "all" && lead.status !== activeTab) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.source.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Sheet open={createLeadOpen} onOpenChange={setCreateLeadOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Create New Lead</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <LeadCreationForm 
                onSuccess={() => setCreateLeadOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs 
          defaultValue="active" 
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="waiting_for_details">Waiting for Details</TabsTrigger>
            <TabsTrigger value="waiting_for_approval">Waiting for Approval</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
            <TabsTrigger value="all">All Leads</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground">Loading leads...</p>
            </CardContent>
          </Card>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground">No leads found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => {
            const statusDetails = getStatusDetails(lead.status);
            
            return (
              <Card key={lead.id} className="animate-slide-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-medium">{lead.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {statusDetails.icon}
                      <span>{statusDetails.label}</span>
                    </div>
                  </div>
                  <div className={`${getPriorityColor(lead.priority)} w-3 h-3 rounded-full`} />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Inquiry Type</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {lead.inquiryType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Source</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {lead.source}
                      </p>
                    </div>
                    {lead.exportQuota !== undefined && (
                      <div>
                        <p className="text-sm font-medium">Export Quota</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.exportQuota}%
                        </p>
                      </div>
                    )}
                    {lead.plotSize !== undefined && (
                      <div>
                        <p className="text-sm font-medium">Plot Size</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.plotSize} hectares
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {lead.status === "waiting_for_approval" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleApprove(lead.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(lead.id)}>
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {lead.status === "active" && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleArchive(lead.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  )}
                  
                  {lead.status === "waiting_for_details" && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toast({
                        title: "Edit Lead",
                        description: "Editing functionality will be implemented in the next phase"
                      })}
                    >
                      Update Details
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
