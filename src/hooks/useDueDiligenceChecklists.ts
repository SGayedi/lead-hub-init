
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DueDiligenceChecklist, DueDiligenceChecklistItem, ChecklistItemStatus } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database checklist to frontend type
const convertDbChecklistToChecklist = (dbChecklist: any): DueDiligenceChecklist => ({
  id: dbChecklist.id,
  opportunity_id: dbChecklist.opportunity_id,
  template_id: dbChecklist.template_id,
  name: dbChecklist.name,
  created_at: dbChecklist.created_at,
  updated_at: dbChecklist.updated_at
});

// Convert database checklist item to frontend type
const convertDbChecklistItemToChecklistItem = (dbItem: any): DueDiligenceChecklistItem => ({
  id: dbItem.id,
  checklist_id: dbItem.checklist_id,
  name: dbItem.name,
  description: dbItem.description,
  status: dbItem.status,
  assigned_to: dbItem.assigned_to,
  due_date: dbItem.due_date,
  completed_at: dbItem.completed_at,
  completed_by: dbItem.completed_by,
  notes: dbItem.notes,
  order_index: dbItem.order_index,
  created_at: dbItem.created_at,
  updated_at: dbItem.updated_at
});

export function useDueDiligenceChecklists(opportunityId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: checklist, isLoading: isChecklistLoading, error: checklistError } = useQuery({
    queryKey: ['checklist', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('due_diligence_checklists')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .limit(1);
      
      if (error) throw error;
      
      return data.length > 0 ? convertDbChecklistToChecklist(data[0]) : null;
    },
    enabled: !!opportunityId
  });

  const { data: checklistItems, isLoading: isItemsLoading, error: itemsError, refetch: refetchItems } = useQuery({
    queryKey: ['checklist_items', checklist?.id],
    queryFn: async () => {
      if (!checklist) return [];
      
      const { data, error } = await supabase
        .from('due_diligence_checklist_items')
        .select('*')
        .eq('checklist_id', checklist.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      return data.map(convertDbChecklistItemToChecklistItem);
    },
    enabled: !!checklist?.id
  });

  const updateChecklistItemStatus = useMutation({
    mutationFn: async ({ 
      itemId, 
      status, 
      notes 
    }: { 
      itemId: string, 
      status: ChecklistItemStatus, 
      notes?: string 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const updateData: any = { status };
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      // Set completed info if status is completed
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
      } else {
        // If moving from completed to another status, clear completed fields
        updateData.completed_at = null;
        updateData.completed_by = null;
      }
      
      // Update checklist item
      const { error } = await supabase
        .from('due_diligence_checklist_items')
        .update(updateData)
        .eq('id', itemId);
      
      if (error) throw error;
      
      // If checklist is for an opportunity, update the opportunity assessment status
      if (opportunityId) {
        await supabase
          .rpc('update_opportunity_assessment_status', { 
            opportunity_id_param: opportunityId 
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Checklist item updated successfully');
    },
    onError: (error) => {
      console.error('Error updating checklist item:', error);
      toast.error('Failed to update checklist item');
    }
  });

  const updateChecklistItemNotes = useMutation({
    mutationFn: async ({ 
      itemId, 
      notes 
    }: { 
      itemId: string, 
      notes: string 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Update checklist item notes
      const { error } = await supabase
        .from('due_diligence_checklist_items')
        .update({ notes })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items'] });
      toast.success('Checklist item notes updated');
    },
    onError: (error) => {
      console.error('Error updating checklist item notes:', error);
      toast.error('Failed to update notes');
    }
  });

  const assignChecklistItem = useMutation({
    mutationFn: async ({ 
      itemId, 
      assignedTo, 
      dueDate 
    }: { 
      itemId: string, 
      assignedTo?: string, 
      dueDate?: string 
    }) => {
      const updateData: any = {};
      
      if (assignedTo !== undefined) {
        updateData.assigned_to = assignedTo;
      }
      
      if (dueDate !== undefined) {
        updateData.due_date = dueDate;
      }
      
      // Update checklist item
      const { error } = await supabase
        .from('due_diligence_checklist_items')
        .update(updateData)
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist_items'] });
      toast.success('Checklist item assignment updated');
    },
    onError: (error) => {
      console.error('Error assigning checklist item:', error);
      toast.error('Failed to update assignment');
    }
  });

  return {
    checklist,
    checklistItems: checklistItems || [],
    isLoading: isChecklistLoading || isItemsLoading,
    error: checklistError || itemsError,
    refetchItems,
    updateChecklistItemStatus,
    updateChecklistItemNotes,
    assignChecklistItem
  };
}
