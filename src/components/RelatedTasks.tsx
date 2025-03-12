
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TaskCreationForm } from "@/components/TaskCreationForm";

interface RelatedTasksProps {
  entityId: string;
  entityType: "lead" | "meeting";
}

export function RelatedTasks({ entityId, entityType }: RelatedTasksProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { tasks, isLoading } = useTasks({
    searchTerm: "",
    onlyRelatedTo: {
      entityId,
      entityType
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
