
import { Opportunity } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusStyle } from "@/lib/utils";

export interface OpportunityDialogHeaderProps {
  opportunity: Opportunity;
  onClose: () => void;
}

export function OpportunityDialogHeader({ 
  opportunity,
  onClose
}: OpportunityDialogHeaderProps) {
  const statusStyle = getStatusStyle(opportunity.status);
  
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Opportunity</h2>
          <Badge
            className={`${statusStyle.bgColor} ${statusStyle.color}`}
          >
            {opportunity.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {opportunity.lead?.name || 'Lead info not available'}
        </p>
      </div>
      
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
