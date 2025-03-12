
import { CheckCircle2 } from "lucide-react";
import { Task } from "@/types/crm";
import { Badge } from "@/components/ui/badge";

interface TasksListProps {
  tasks: Task[];
}

export function TasksList({ tasks }: TasksListProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-4 w-4" />
        Tasks
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground">
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge 
                variant="outline" 
                className={
                  task.priority === "high" 
                    ? "bg-red-50 text-red-700 border-red-200" 
                    : task.priority === "medium"
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }
              >
                {task.priority}
              </Badge>
              <Badge 
                variant="outline"
                className={
                  task.status === "completed" 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : task.status === "in_progress"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }
              >
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
