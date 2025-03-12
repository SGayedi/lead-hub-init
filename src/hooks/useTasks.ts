
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, Priority, TaskStatus } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database task to frontend Task type
const convertDbTaskToTask = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  assignedTo: dbTask.assigned_to,
  assignedBy: dbTask.assigned_by,
  status: dbTask.status,
  priority: dbTask.priority,
  dueDate: dbTask.due_date,
  relatedEntityId: dbTask.related_entity_id,
  relatedEntityType: dbTask.related_entity_type,
  createdAt: dbTask.created_at,
  updatedAt: dbTask.updated_at
});

interface TaskFilter {
  status?: TaskStatus;
  priority?: Priority;
  onlyAssignedToMe?: boolean;
  onlyCreatedByMe?: boolean;
  searchTerm?: string;
}

export function useTasks(filter: TaskFilter = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState(filter.searchTerm || '');

  const { 
    status, 
    priority, 
    onlyAssignedToMe = false, 
    onlyCreatedByMe = false
  } = filter;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', status, priority, onlyAssignedToMe, onlyCreatedByMe, searchTerm, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase.from('tasks').select('*');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (priority) {
        query = query.eq('priority', priority);
      }
      
      if (onlyAssignedToMe) {
        query = query.eq('assigned_to', user.id);
      }
      
      if (onlyCreatedByMe) {
        query = query.eq('assigned_by', user.id);
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbTaskToTask);
    },
    enabled: !!user
  });

  const createTask = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'assignedBy' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description,
          assigned_to: newTask.assignedTo,
          assigned_by: user.id,
          status: newTask.status || 'pending',
          priority: newTask.priority,
          due_date: newTask.dueDate,
          related_entity_id: newTask.relatedEntityId,
          related_entity_type: newTask.relatedEntityType
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    }
  });

  const updateTask = useMutation({
    mutationFn: async (task: Partial<Task> & { id: string }) => {
      const { id, ...updateFields } = task;
      
      // Convert camelCase to snake_case for database
      const dbFields: any = {};
      for (const [key, value] of Object.entries(updateFields)) {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        dbFields[snakeKey] = value;
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(dbFields)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  });

  return {
    tasks: data || [],
    isLoading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    searchTerm,
    setSearchTerm
  };
}
