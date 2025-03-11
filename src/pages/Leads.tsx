
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Clock, CheckCircle, Archive, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Lead, LeadStatus } from "@/types/crm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LeadCreationForm } from "@/components/LeadCreationForm";

// Extended mock leads to include different statuses
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Acme Corp",
    inquiryType: "company",
    priority: "high",
    source: "referral",
    status: "active",
    exportQuota: 80,
    plotSize: 2,
    email: "info@acme.com",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Global Enterprises",
    inquiryType: "company",
    priority: "medium",
    source: "website",
    status: "waiting_for_details",
    exportQuota: 60,
    plotSize: 0.8,
    email: "contact@global.co",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    name: "Eastern Development LLC",
    inquiryType: "company",
    priority: "high",
    source: "direct",
    status: "waiting_for_approval",
    exportQuota: 70,
    plotSize: 0.9,
    email: "business@eastern.com",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    name: "John Smith",
    inquiryType: "individual",
    priority: "low",
    source: "event",
    status: "archived",
    email: "john.smith@email.com",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("active");
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
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: "active" as LeadStatus } 
          : lead
      )
    );
    
    toast({
      title: "Lead Approved",
      description: "The lead has been approved and is now active."
    });
  };

  const handleReject = (leadId: string) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: "rejected" as LeadStatus } 
          : lead
      )
    );
    
    toast({
      title: "Lead Rejected",
      description: "The lead has been rejected."
    });
  };

  const handleArchive = (leadId: string) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: "archived" as LeadStatus } 
          : lead
      )
    );
    
    toast({
      title: "Lead Archived",
      description: "The lead has been archived."
    });
  };

  // Filter leads based on search query and active tab
  const filteredLeads = leads.filter(lead => {
    // Status filter
    if (activeTab !== "all" && lead.status !== activeTab) {
      return false;
    }
    
    // Search filter
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
        {filteredLeads.length === 0 ? (
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
                  
                  {/* Actions based on status */}
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
