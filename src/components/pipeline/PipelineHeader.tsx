
import React from "react";
import { Button } from "@/components/ui/button";
import { PipelineType } from "@/types/pipeline";

interface PipelineHeaderProps {
  type: PipelineType;
}

export const PipelineHeader = ({ type }: PipelineHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {type === 'lead' ? 'Lead Pipeline' : 'Opportunity Pipeline'}
        </h1>
        <p className="text-muted-foreground">
          {type === 'lead' 
            ? 'Manage and track your leads through each stage of the eligibility process.' 
            : 'Manage and track your opportunities through each stage of the due diligence process.'}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Refresh
        </Button>
        {type === 'lead' && (
          <Button size="sm">Create Lead</Button>
        )}
      </div>
    </div>
  );
};
