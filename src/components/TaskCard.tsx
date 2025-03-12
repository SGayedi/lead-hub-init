
import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Task } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onView?: (taskId: string) => void;
}

export function TaskCard({ task, onView }: TaskCardProps) {
  const { updateTask } = useTasks();
  
  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask.mutate({ id: task.id, status: 'completed' });
  };
  
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'canceled';
  
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 hover:shadow transition-shadow cursor-pointer",
        isPastDue && "border-red-300 bg-red-50"
      )}
      onClick={() => onView && onView(task.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="font-semibold">{task.title}</h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className={getPriorityColor()}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          <Badge variant="outline" className={getStatusColor()}>
            {task.status.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Badge>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-muted-foreground">
          {task.dueDate ? (
            <span className={cn(
              isPastDue && "text-red-600 font-semibold",
              isDueToday && "text-amber-600 font-semibold"
            )}>
              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </span>
          ) : (
            <span>No due date</span>
          )}
        </div>
        
        {task.status !== 'completed' && task.status !== 'canceled' && (
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs h-7"
            onClick={handleComplete}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}
