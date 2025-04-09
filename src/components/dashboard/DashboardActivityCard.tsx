
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  dueDate?: string; // Made optional to match crm.ts definition
  status: string;
  priority: string;
}

interface DashboardActivityCardProps {
  tasks: Task[];
}

export function DashboardActivityCard({ tasks }: DashboardActivityCardProps) {
  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className="flex items-start p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="mr-4">
            {getPriorityIcon(task.priority)}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{task.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                task.status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {task.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {task.dueDate ? `Due ${formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}` : 'No due date'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
