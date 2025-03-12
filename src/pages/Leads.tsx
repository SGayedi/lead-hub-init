
import { useState } from "react";
import { PlusCircle, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/useLeads";
import { LeadCreationForm } from "@/components/LeadCreationForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Lead, LeadStatus } from "@/types/crm";
import { toast } from "sonner";

export default function Leads() {
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const { leads, isLoading, searchTerm, setSearchTerm } = useLeads(filterStatus);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'waiting_for_details': return 'bg-blue-100 text-blue-800';
      case 'waiting_for_approval': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'archived': return 'Archived';
      case 'waiting_for_details': return 'Waiting for Details';
      case 'waiting_for_approval': return 'Waiting for Approval';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage your leads and opportunities
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => setShowCreateDialog(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Lead
        </Button>
      </header>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={filterStatus} 
            onValueChange={(value) => setFilterStatus(value as LeadStatus | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="waiting_for_details">Waiting for Details</SelectItem>
              <SelectItem value="waiting_for_approval">Waiting for Approval</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No leads found. Create your first lead to get started.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      {lead.inquiryType === 'company' ? 'Company' : 'Individual'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(lead.priority)}
                      >
                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(lead.status)}
                      >
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.email || '-'}</TableCell>
                    <TableCell>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {lead.status === 'waiting_for_approval' && (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-8 w-8 text-green-600"
                              title="Approve"
                              onClick={() => toast.success("Approved! This functionality will be implemented soon.")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              className="h-8 w-8 text-red-600"
                              title="Reject"
                              onClick={() => toast.error("Rejected! This functionality will be implemented soon.")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {lead.status === 'waiting_for_details' && (
                          <Button 
                            size="icon" 
                            variant="ghost"
                            className="h-8 w-8"
                            title="Mark as Complete"
                            onClick={() => toast.info("Soon you'll be able to update lead details here!")}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Create New Lead</DialogTitle>
          <LeadCreationForm onSuccess={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
