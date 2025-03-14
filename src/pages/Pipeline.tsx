
import React, { useState } from "react";
import { PipelineHeader } from "@/components/pipeline/PipelineHeader";
import { PipelineFilter } from "@/components/pipeline/PipelineFilter";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { PipelineType } from "@/types/pipeline";
import { usePipeline } from "@/hooks/usePipeline";

export default function Pipeline() {
  const [type, setType] = useState<PipelineType>('lead');
  const { searchTerm, setSearchTerm } = usePipeline(type);
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleTypeChange = (value: PipelineType) => {
    setType(value);
  };
  
  return (
    <div className="animate-fade-in">
      <PipelineHeader type={type} />
      
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-6">
        <PipelineFilter 
          type={type}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
        />
        
        <PipelineBoard type={type} />
      </div>
    </div>
  );
}
