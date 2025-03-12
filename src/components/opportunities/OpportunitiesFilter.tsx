
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { OpportunityStatus } from "@/types/crm";

interface OpportunitiesFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: OpportunityStatus | 'all';
  onFilterChange: (value: OpportunityStatus | 'all') => void;
}

export function OpportunitiesFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange
}: OpportunitiesFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search opportunities..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Select 
        value={filterStatus} 
        onValueChange={(value) => onFilterChange(value as OpportunityStatus | 'all')}
      >
        <SelectTrigger className="w-full md:w-[220px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Opportunities</SelectItem>
          <SelectItem value="assessment_in_progress">Assessment In Progress</SelectItem>
          <SelectItem value="assessment_completed">Assessment Completed</SelectItem>
          <SelectItem value="waiting_for_approval">Waiting For Approval</SelectItem>
          <SelectItem value="due_diligence_approved">Due Diligence Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
