
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { Lead } from "@/types/crm";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";

interface LeadToOpportunityButtonProps {
  lead: Lead;
  onConverted?: () => void;
}

export function LeadToOpportunityButton({ lead, onConverted }: LeadToOpportunityButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { convertLeadToOpportunity } = useOpportunities();

  const handleConvert = async () => {
    try {
      await convertLeadToOpportunity.mutateAsync(lead.id);
      setShowConfirmDialog(false);
      if (onConverted) {
        onConverted();
      }
    } catch (error) {
      console.error("Error converting lead:", error);
      toast.error("Failed to convert lead to opportunity");
    }
  };

  // Only allow conversion for active leads that are waiting for approval
  const canConvert = lead.status === "waiting_for_approval";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        disabled={!canConvert || convertLeadToOpportunity.isPending}
        onClick={() => setShowConfirmDialog(true)}
        title={canConvert ? "Convert to Opportunity" : "Only leads waiting for approval can be converted"}
      >
        <ArrowRightCircle className="h-4 w-4" />
        <span className="hidden md:inline">Convert to Opportunity</span>
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Opportunity</DialogTitle>
            <DialogDescription>
              This will create a new opportunity from this lead and archive the lead.
              Are you sure you want to convert this lead to an opportunity?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={convertLeadToOpportunity.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={convertLeadToOpportunity.isPending}
            >
              {convertLeadToOpportunity.isPending ? "Converting..." : "Convert to Opportunity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
