
import { useState } from "react";
import { OpportunitiesHeader } from "@/components/opportunities/OpportunitiesHeader";
import { OpportunitiesFilter } from "@/components/opportunities/OpportunitiesFilter";
import { OpportunitiesTable } from "@/components/opportunities/OpportunitiesTable";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityDetailsDialog } from "@/components/opportunities/OpportunityDetailsDialog";

export default function Opportunities() {
  const [filterStatus, setFilterStatus] = useState<OpportunityStatus | 'all'>('all');
  const { opportunities, isLoading, searchTerm, setSearchTerm, refetch } = useOpportunities(filterStatus);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  const handleOpportunityUpdated = () => {
    refetch();
  };
  
  return (
    <div className="animate-fade-in">
      <OpportunitiesHeader />
      
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <OpportunitiesFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />
        
        <OpportunitiesTable
          opportunities={opportunities}
          isLoading={isLoading}
          onViewDetails={setSelectedOpportunity}
        />
      </div>

      <OpportunityDetailsDialog 
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onOpportunityUpdated={handleOpportunityUpdated}
      />
    </div>
  );
}
