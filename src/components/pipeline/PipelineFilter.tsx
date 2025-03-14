
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PipelineType } from '@/types/pipeline';

interface PipelineFilterProps {
  type: PipelineType;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: PipelineType) => void;
}

export const PipelineFilter = ({ 
  type, 
  searchTerm, 
  onSearchChange,
  onTypeChange
}: PipelineFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={`Search ${type === 'lead' ? 'leads' : 'opportunities'}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-2">
        <Select
          value={type}
          onValueChange={(value) => onTypeChange(value as PipelineType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pipeline Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lead">Lead Pipeline</SelectItem>
            <SelectItem value="opportunity">Opportunity Pipeline</SelectItem>
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger className="w-[120px]">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority_high">High Priority</SelectItem>
            <SelectItem value="priority_medium">Medium Priority</SelectItem>
            <SelectItem value="priority_low">Low Priority</SelectItem>
            <SelectItem value="today">Updated Today</SelectItem>
            <SelectItem value="week">Updated This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
