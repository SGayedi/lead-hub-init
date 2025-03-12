
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "./TaskCard";
import { Spinner } from "./Spinner";
import { TaskStatus } from "@/types/crm";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RelatedTasksProps {
  entityId: string;
  entityType: "lead" | "meeting";
}

export function RelatedTasks({ entityId, entityType }: RelatedTasksProps) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const { tasks, isLoading } = useTasks();
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      let filtered = tasks.filter(
        (task) => 
          task.relatedEntityId === entityId && 
          task.relatedEntityType === entityType
      );
      
      if (statusFilter !== "all") {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
      
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks([]);
    }
  }, [tasks, entityId, entityType, statusFilter]);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found for this {entityType}.
            </div>
          )}
        </>
      )}
    </div>
  );
}
