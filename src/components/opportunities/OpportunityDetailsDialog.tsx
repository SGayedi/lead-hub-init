
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityDetailsTab } from "./OpportunityDetailsTab";
import { OpportunityChecklistTab } from "./OpportunityChecklistTab";
import { OpportunityNdaTab } from "./OpportunityNdaTab";
import { OpportunityBusinessPlanTab } from "./OpportunityBusinessPlanTab";
import { OpportunityTasksTab } from "./OpportunityTasksTab";
import { OpportunityDocumentsTab } from "./OpportunityDocumentsTab";
import { OpportunityDialogHeader } from "./OpportunityDialogHeader";
import { Opportunity } from "@/types/crm";

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
  if (!opportunity) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <OpportunityDialogHeader 
          opportunity={opportunity}
          onClose={onClose}
        />
        
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full justify-start border-b pb-0 gap-2 bg-transparent">
            <TabsTrigger value="details" className="data-[state=active]:bg-background">
              Details
            </TabsTrigger>
            <TabsTrigger value="checklist" className="data-[state=active]:bg-background">
              Due Diligence
            </TabsTrigger>
            <TabsTrigger value="nda" className="data-[state=active]:bg-background">
              NDA
            </TabsTrigger>
            <TabsTrigger value="business-plan" className="data-[state=active]:bg-background">
              Business Plan
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-background">
              Documents
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-background">
              Tasks
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-card rounded-md p-4 overflow-y-auto flex-1">
            <TabsContent value="details" className="mt-0">
              <OpportunityDetailsTab opportunity={opportunity} />
            </TabsContent>
            
            <TabsContent value="checklist" className="mt-0">
              <OpportunityChecklistTab opportunityId={opportunity.id} />
            </TabsContent>
            
            <TabsContent value="nda" className="mt-0">
              <OpportunityNdaTab opportunity={opportunity} />
            </TabsContent>
            
            <TabsContent value="business-plan" className="mt-0">
              <OpportunityBusinessPlanTab opportunityId={opportunity.id} />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-0">
              <OpportunityDocumentsTab opportunityId={opportunity.id} />
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-0">
              <OpportunityTasksTab opportunity={opportunity} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
