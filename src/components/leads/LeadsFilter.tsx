
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { LeadStatus } from "@/types/crm";

interface LeadsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: LeadStatus | 'all';
  onFilterChange: (value: LeadStatus | 'all') => void;
}

export function LeadsFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange
}: LeadsFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Select 
        value={filterStatus} 
        onValueChange={(value) => onFilterChange(value as LeadStatus | 'all')}
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
  );
}
