
import { useState } from "react";
import { LeadsHeader } from "@/components/leads/LeadsHeader";
import { LeadsFilter } from "@/components/leads/LeadsFilter";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Lead, LeadStatus } from "@/types/crm";
import { useLeads } from "@/hooks/useLeads";
import { LeadCreationForm } from "@/components/LeadCreationForm";
import { LeadDetailsDialog } from "@/components/LeadDetailsDialog";

export default function Leads() {
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const { leads, isLoading, searchTerm, setSearchTerm, refetch } = useLeads(filterStatus);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const handleLeadUpdated = () => {
    refetch();
  };
  
  return (
    <div className="animate-fade-in">
      <LeadsHeader onCreateClick={() => setShowCreateDialog(true)} />
      
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <LeadsFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />
        
        <LeadsTable
          leads={leads}
          isLoading={isLoading}
          onViewDetails={setSelectedLead}
        />
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Create New Lead</DialogTitle>
          <LeadCreationForm onSuccess={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      <LeadDetailsDialog 
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  );
}
