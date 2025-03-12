
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TaskCreationForm } from "@/components/TaskCreationForm";
import { RelatedTasks } from "@/components/RelatedTasks";

interface MeetingTasksTabProps {
  meetingId: string;
  meetingTitle: string;
}

export function MeetingTasksTab({ meetingId, meetingTitle }: MeetingTasksTabProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {showTaskForm && (
        <div className="border p-4 rounded-md bg-muted/50 mb-4">
          <h4 className="font-medium mb-2">Create Task for {meetingTitle}</h4>
          <TaskCreationForm 
            onSuccess={() => setShowTaskForm(false)}
            relatedEntityId={meetingId}
            relatedEntityType="meeting"
          />
        </div>
      )}

      <RelatedTasks entityId={meetingId} entityType="meeting" />
    </div>
  );
}
