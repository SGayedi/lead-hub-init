
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database notification to frontend Notification type
const convertDbNotificationToNotification = (dbNotification: any): Notification => ({
  id: dbNotification.id,
  userId: dbNotification.user_id,
  title: dbNotification.title,
  message: dbNotification.message,
  type: dbNotification.type,
  read: dbNotification.read,
  relatedEntityId: dbNotification.related_entity_id,
  relatedEntityType: dbNotification.related_entity_type,
  createdAt: dbNotification.created_at,
  updatedAt: dbNotification.updated_at
});

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbNotificationToNotification);
    },
    enabled: !!user
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(`Failed to mark notification as read: ${error.message}`);
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(`Failed to mark all notifications as read: ${error.message}`);
    }
  });

  return {
    notifications: data || [],
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    unreadCount: data?.filter(notification => !notification.read).length || 0
  };
}
