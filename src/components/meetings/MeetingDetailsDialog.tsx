
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, CalendarClock } from "lucide-react";
import { Meeting } from "@/types/crm";
import { CommentSection } from "@/components/CommentSection";
import { MeetingDetailsTab } from "./MeetingDetailsTab";
import { MeetingTasksTab } from "./MeetingTasksTab";
import { LeadDocumentsTab } from "@/components/leads/LeadDocumentsTab";

interface MeetingDetailsDialogProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingDetailsDialog({ 
  meeting, 
  isOpen, 
  onClose 
}: MeetingDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  if (!meeting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meeting.title}</DialogTitle>
        </DialogHeader>

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
            <MeetingDetailsTab meeting={meeting} />
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <LeadDocumentsTab leadId={meeting.id} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <MeetingTasksTab 
              meetingId={meeting.id} 
              meetingTitle={meeting.title} 
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <CommentSection 
              relatedEntityId={meeting.id} 
              relatedEntityType="meeting"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
