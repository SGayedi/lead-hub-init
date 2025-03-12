
import React from 'react';
import { format } from 'date-fns';
import { Bell, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Notification } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationCardProps {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationCard({ notification, onClose }: NotificationCardProps) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
  
  const getIcon = () => {
    switch (notification.type) {
      case 'lead_high_priority':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'lead_inactive':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'lead_archived':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task_assigned':
        return <Bell className="h-4 w-4 text-purple-500" />;
      case 'task_due_soon':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'meeting_reminder':
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const handleClick = () => {
    markAsRead.mutate(notification.id);
    
    if (notification.relatedEntityType && notification.relatedEntityId) {
      let path;
      switch (notification.relatedEntityType) {
        case 'lead':
          path = `/leads/${notification.relatedEntityId}`;
          break;
        case 'task':
          path = `/tasks/${notification.relatedEntityId}`;
          break;
        case 'meeting':
          path = `/meetings/${notification.relatedEntityId}`;
          break;
        default:
          break;
      }
      
      if (path) {
        if (onClose) onClose();
        navigate(path);
      }
    }
  };
  
  return (
    <div 
      className={cn(
        "p-3 border-b hover:bg-accent cursor-pointer",
        !notification.read && "bg-accent/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-muted-foreground">{notification.message}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        )}
      </div>
    </div>
  );
}
