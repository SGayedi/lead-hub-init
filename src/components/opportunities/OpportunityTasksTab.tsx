
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { RelatedTasks } from "@/components/RelatedTasks";
import { TaskCreationForm } from "@/components/TaskCreationForm";
import { 
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";

interface OpportunityTasksTabProps {
  opportunityId: string;
}

export function OpportunityTasksTab({ opportunityId }: OpportunityTasksTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Tasks</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </CardHeader>
        <CardContent>
          <RelatedTasks 
            relatedEntityId={opportunityId}
            relatedEntityType="opportunity"
          />
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogTitle>Create New Task</DialogTitle>
          <TaskCreationForm 
            relatedEntityId={opportunityId}
            relatedEntityType="opportunity"
            onSuccess={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
