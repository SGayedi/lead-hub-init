
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, CalendarClock } from "lucide-react";
import { Lead } from "@/types/crm";
import { CommentSection } from "@/components/CommentSection";
import { useLeadEditor } from "@/hooks/useLeadEditor";
import { LeadDialogHeader } from "@/components/leads/LeadDialogHeader";
import { LeadDetailsTab } from "@/components/leads/LeadDetailsTab";
import { LeadDocumentsTab } from "@/components/leads/LeadDocumentsTab";
import { LeadTasksTab } from "@/components/leads/LeadTasksTab";
import { useRecordLocks } from "@/hooks/useRecordLocks";
import { RecordLockAlert } from "@/components/RecordLockAlert";

interface LeadDetailsDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated?: () => void;
}

export function LeadDetailsDialog({ lead, isOpen, onClose, onLeadUpdated }: LeadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { 
    isEditMode, 
    setIsEditMode,
    isSaving,
    editedLead,
    setEditedLead,
    handleSave,
    handleCancel
  } = useLeadEditor(lead, onLeadUpdated);
  
  const { acquireLock, releaseLock, checkLock } = useRecordLocks();
  const { data: lockInfo } = lead ? checkLock("lead", lead.id) : { data: null };
  
  // Acquire a lock when opening the dialog or entering edit mode
  useEffect(() => {
    if (isOpen && lead) {
      acquireLock.mutate({
        entityType: "lead",
        entityId: lead.id
      });
      
      // Release the lock when closing the dialog
      return () => {
        releaseLock.mutate({
          entityType: "lead",
          entityId: lead.id
        });
      };
    }
  }, [isOpen, lead, isEditMode]);
  
  const isLockedByOther = lockInfo?.locked;

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <LeadDialogHeader
          lead={lead}
          isEditMode={isEditMode}
          isSaving={isSaving}
          setIsEditMode={setIsEditMode}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        
        {isLockedByOther && lockInfo.locked_by && (
          <RecordLockAlert 
            lockedBy={{
              name: lockInfo.locked_by.name,
              email: lockInfo.locked_by.email
            }}
            expiresAt={lockInfo.expires_at!}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <CalendarClock className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <LeadDetailsTab 
              lead={lead}
              isEditMode={isEditMode && !isLockedByOther}
              editedLead={editedLead}
              setEditedLead={setEditedLead}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <LeadDocumentsTab leadId={lead.id} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <LeadTasksTab leadId={lead.id} leadName={lead.name} />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <CommentSection 
              relatedEntityId={lead.id} 
              relatedEntityType="lead"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
