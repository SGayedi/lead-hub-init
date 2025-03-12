
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TaskCreationForm } from "@/components/TaskCreationForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskEditForm } from "@/components/TaskEditForm";
import { Task } from "@/types/crm";

interface RelatedTasksProps {
  entityId: string;
  entityType: "lead" | "meeting" | "opportunity";
}

export function RelatedTasks({ entityId, entityType }: RelatedTasksProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { tasks, isLoading } = useTasks({
    searchTerm: "",
    onlyRelatedTo: {
      entityId,
      entityType
    }
  });

  const handleViewTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">
          {tasks.length === 0 ? "No tasks yet" : `${tasks.length} Task${tasks.length !== 1 ? 's' : ''}`}
        </h3>
        {!showTaskForm && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      {showTaskForm ? (
        <div className="border p-4 rounded-md bg-muted/50 mb-4">
          <TaskCreationForm 
            onSuccess={() => setShowTaskForm(false)}
            relatedEntityId={entityId}
            relatedEntityType={entityType}
          />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No tasks related to this {entityType}.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onView={handleViewTask} />
          ))}
        </div>
      )}

      {/* View/Edit Task Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Edit Task</DialogTitle>
          {selectedTask && (
            <TaskEditForm 
              task={selectedTask} 
              onSuccess={() => setSelectedTask(null)}
              onCancel={() => setSelectedTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
