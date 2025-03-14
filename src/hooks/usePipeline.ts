
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PipelineStage, PipelineColumn, PipelineType } from '@/types/pipeline';

export function usePipeline(type: PipelineType = 'lead') {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch pipeline stages
  const { 
    data: stages, 
    isLoading: isLoadingStages, 
    error: stagesError 
  } = useQuery({
    queryKey: ['pipeline_stages', type],
    queryFn: async () => {
      // Use direct fetch for custom RPC functions
      const { data, error } = await supabase.from('pipeline_stages')
        .select('*')
        .eq('type', type)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      return data as PipelineStage[];
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
      let items;
      if (type === 'lead') {
        const { data, error } = await supabase.from('leads')
          .select('*')
          .neq('status', 'archived');
        
        if (error) throw error;
        items = data;
      } else {
        const { data, error } = await supabase.from('opportunities')
          .select('*, leads(name)')
          .neq('status', 'archived');
        
        if (error) throw error;
        items = data;
      }
      
      // Map items to their stages
      items.forEach(item => {
        const stageId = item.stage_id || stages[0].id; // Default to first stage if no stage_id
        
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

  // Move item to a different stage
  const moveItem = useMutation({
    mutationFn: async ({ 
      entityId, 
      targetStageId 
    }: { 
      entityId: string; 
      targetStageId: string; 
    }) => {
      // Update the stage_id based on entity type
      const table = type === 'lead' ? 'leads' : 'opportunities';
      
      const { data, error } = await supabase
        .from(table)
        .update({ stage_id: targetStageId })
        .eq('id', entityId)
        .select();
      
      if (error) throw error;
      
      return { success: true, data };
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
