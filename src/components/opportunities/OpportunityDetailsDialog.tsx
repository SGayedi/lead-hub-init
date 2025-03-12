import { useState } from "react";
import { 
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, CalendarClock, ClipboardCheck, FileSignature, BarChart2 } from "lucide-react";
import { Opportunity } from "@/types/crm";
import { CommentSection } from "@/components/CommentSection";
import { OpportunityDialogHeader } from "./OpportunityDialogHeader";
import { OpportunityDetailsTab } from "./OpportunityDetailsTab";
import { OpportunityNdaTab } from "./OpportunityNdaTab";
import { OpportunityBusinessPlanTab } from "./OpportunityBusinessPlanTab";
import { OpportunityChecklistTab } from "./OpportunityChecklistTab";
import { OpportunityDocumentsTab } from "./OpportunityDocumentsTab";
import { OpportunityTasksTab } from "./OpportunityTasksTab";

interface OpportunityDetailsDialogProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onOpportunityUpdated?: () => void;
}

export function OpportunityDetailsDialog({ 
  opportunity, 
  isOpen, 
  onClose,
  onOpportunityUpdated
}: OpportunityDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!opportunity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <OpportunityDialogHeader
          opportunity={opportunity}
          onUpdated={onOpportunityUpdated}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="nda" className="flex items-center gap-1">
              <FileSignature className="h-4 w-4" />
              NDA
            </TabsTrigger>
            <TabsTrigger value="business-plan" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              Business Plan
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1">
              <ClipboardCheck className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <OpportunityDetailsTab 
              opportunity={opportunity}
            />
          </TabsContent>

          <TabsContent value="nda" className="mt-4">
            <OpportunityNdaTab opportunity={opportunity} />
          </TabsContent>

          <TabsContent value="business-plan" className="mt-4">
            <OpportunityBusinessPlanTab opportunityId={opportunity.id} />
          </TabsContent>

          <TabsContent value="checklist" className="mt-4">
            <OpportunityChecklistTab opportunity={opportunity} />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <OpportunityDocumentsTab opportunity={opportunity} />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <CommentSection 
              relatedEntityId={opportunity.id} 
              relatedEntityType="opportunity"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
