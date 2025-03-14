
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PipelineStage, PipelineColumn, PipelineType } from '@/types/pipeline';
import { Lead, Opportunity } from '@/types/crm';

// Create mock pipeline stages since there's no pipeline_stages table
const getDefaultStages = (type: PipelineType): PipelineStage[] => {
  if (type === 'lead') {
    return [
      { id: 'new', name: 'New Leads', description: 'Recently added leads', order_index: 0, color: '#4caf50', type: 'lead', created_at: '', updated_at: '' },
      { id: 'contacted', name: 'Contacted', description: 'Leads that have been contacted', order_index: 1, color: '#2196f3', type: 'lead', created_at: '', updated_at: '' },
      { id: 'qualified', name: 'Qualified', description: 'Qualified leads', order_index: 2, color: '#ff9800', type: 'lead', created_at: '', updated_at: '' },
      { id: 'meeting', name: 'Meeting Scheduled', description: 'Leads with a scheduled meeting', order_index: 3, color: '#9c27b0', type: 'lead', created_at: '', updated_at: '' }
    ];
  } else {
    return [
      { id: 'assessment_in_progress', name: 'Assessment In Progress', description: 'Opportunities in assessment', order_index: 0, color: '#4caf50', type: 'opportunity', created_at: '', updated_at: '' },
      { id: 'assessment_completed', name: 'Assessment Completed', description: 'Opportunities with completed assessment', order_index: 1, color: '#2196f3', type: 'opportunity', created_at: '', updated_at: '' },
      { id: 'waiting_for_approval', name: 'Waiting For Approval', description: 'Opportunities waiting for approval', order_index: 2, color: '#ff9800', type: 'opportunity', created_at: '', updated_at: '' },
      { id: 'due_diligence_approved', name: 'Due Diligence Approved', description: 'Approved opportunities', order_index: 3, color: '#9c27b0', type: 'opportunity', created_at: '', updated_at: '' },
      { id: 'rejected', name: 'Rejected', description: 'Rejected opportunities', order_index: 4, color: '#f44336', type: 'opportunity', created_at: '', updated_at: '' }
    ];
  }
};

export function usePipeline(type: PipelineType = 'lead') {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch pipeline stages - since there's no pipeline_stages table, we'll use the predefined stages
  const { 
    data: stages, 
    isLoading: isLoadingStages, 
    error: stagesError 
  } = useQuery({
    queryKey: ['pipeline_stages', type],
    queryFn: async () => {
      return getDefaultStages(type);
    }
  });

  // Fetch pipeline items
  const { 
    data: columns, 
    isLoading: isLoadingItems, 
    error: itemsError,
    refetch: refetchItems
  } = useQuery({
    queryKey: ['pipeline_items', type, searchTerm],
    queryFn: async () => {
      if (!stages || stages.length === 0) {
        return [];
      }
      
      // Create an object to store items by stage id
      const stageMap: Record<string, PipelineColumn> = {};
      
      // Initialize columns for each stage
      stages.forEach(stage => {
        stageMap[stage.id] = {
          id: stage.id,
          name: stage.name,
          items: []
        };
      });
      
      // Fetch items based on type
      let items: any[] = [];
      
      if (type === 'lead') {
        // For leads, use the existing leads table
        const { data, error } = await supabase.from('leads')
          .select('*')
          .neq('status', 'archived');
        
        if (error) throw error;
        
        if (data) {
          items = data.map((item: any) => ({
            ...item,
            stage_id: getLeadStageId(item)
          }));
        }
      } else {
        // For opportunities, use the existing opportunities table
        const { data, error } = await supabase.from('opportunities')
          .select('*, leads(name)');
        
        if (error) throw error;
        
        if (data) {
          items = data.map((item: any) => ({
            ...item,
            stage_id: item.status // For opportunities, use status as stage_id
          }));
        }
      }
      
      // Map items to their stages
      items.forEach((item: any) => {
        // Default to first stage if no stage_id or invalid stage_id
        const stageId = item.stage_id && stageMap[item.stage_id] ? item.stage_id : stages[0].id;
        
        if (stageMap[stageId]) {
          // Apply client-side filtering if searchTerm is provided
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            // For leads, search by name
            if (type === 'lead' && item.name?.toLowerCase().includes(searchLower)) {
              stageMap[stageId].items.push(item);
            }
            // For opportunities, search by lead name
            else if (type === 'opportunity' && item.leads?.name?.toLowerCase().includes(searchLower)) {
              stageMap[stageId].items.push(item);
            }
          } else {
            stageMap[stageId].items.push(item);
          }
        }
      });
      
      // Convert map to array
      return Object.values(stageMap);
    },
    enabled: !!stages // Only fetch items when stages are loaded
  });

  // Helper function to determine lead stage based on properties
  function getLeadStageId(lead: Lead): string {
    // You can implement your own logic here to determine the stage of a lead
    // This is a simple example
    if (lead.priority === 'high') {
      return 'qualified';
    } else if (lead.status === 'waiting_for_details' || lead.status === 'waiting_for_approval') {
      return 'contacted';
    } else if (lead.status === 'active') {
      // Check if there are associated meetings (this would require a more complex query)
      // For now, just return 'new'
      return 'new';
    }
    return 'new'; // default stage
  }

  // Move item to a different stage
  const moveItem = useMutation({
    mutationFn: async ({ 
      entityId, 
      targetStageId 
    }: { 
      entityId: string; 
      targetStageId: string; 
    }) => {
      // For leads, we'll need to update based on the targetStageId
      if (type === 'lead') {
        // Map stage IDs to lead properties
        let updateData: Partial<Lead> = {};
        
        switch (targetStageId) {
          case 'new':
            updateData = { status: 'active', priority: 'low' };
            break;
          case 'contacted':
            updateData = { status: 'waiting_for_details' };
            break;
          case 'qualified':
            updateData = { priority: 'high' };
            break;
          case 'meeting':
            updateData = { status: 'active', priority: 'medium' };
            break;
        }
        
        const { data, error } = await supabase
          .from('leads')
          .update(updateData)
          .eq('id', entityId)
          .select();
        
        if (error) throw error;
        
        return { success: true, data };
      } else {
        // For opportunities, update the status directly
        const { data, error } = await supabase
          .from('opportunities')
          .update({ status: targetStageId })
          .eq('id', entityId)
          .select();
        
        if (error) throw error;
        
        return { success: true, data };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_items'] });
      toast.success(`Item moved successfully`);
    },
    onError: (error: any) => {
      console.error('Error moving item:', error);
      toast.error(error.message || 'Failed to move item');
    }
  });

  return {
    stages,
    columns,
    isLoading: isLoadingStages || isLoadingItems,
    error: stagesError || itemsError,
    searchTerm,
    setSearchTerm,
    moveItem,
    refetch: refetchItems
  };
}
