
import { useState } from "react";
import { Opportunity } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Spinner } from "@/components/Spinner";
import { TaskCard } from "@/components/TaskCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TaskCreationForm } from "@/components/TaskCreationForm";

export interface OpportunityTasksTabProps {
  opportunity: Opportunity;
}

export function OpportunityTasksTab({ opportunity }: OpportunityTasksTabProps) {
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  
  const { 
    tasks, 
    isLoading, 
    error 
  } = useTasks({
    relatedEntityId: opportunity.id,
    relatedEntityType: "opportunity"
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading tasks: {error.message}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks</h3>
        <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <TaskCreationForm 
              relatedEntityId={opportunity.id}
              relatedEntityType="opportunity"
              onSuccess={() => setShowNewTaskDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No tasks created yet
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
