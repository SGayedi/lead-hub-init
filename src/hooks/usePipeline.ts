
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
      // For custom functions not in the typed schema, we need to use direct rpc call with type assertions
      const { data, error } = await supabase
        .rpc('get_pipeline_stages', { type_param: type });
      
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
      // For custom functions not in the typed schema, we need to use direct rpc call with type assertions
      const { data, error } = await supabase
        .rpc('get_pipeline_items', { type_param: type });
      
      if (error) throw error;
      
      let result = data as PipelineColumn[];
      
      // Apply client-side filtering if searchTerm is provided
      if (searchTerm && result) {
        result = result.map((column: PipelineColumn) => ({
          ...column,
          items: column.items.filter((item) => {
            // For leads, search by name
            if (type === 'lead') {
              return item.name?.toLowerCase().includes(searchTerm.toLowerCase());
            }
            // For opportunities, search by lead name
            return item.lead_name?.toLowerCase().includes(searchTerm.toLowerCase());
          })
        }));
      }
      
      return result;
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
      // For custom functions not in the typed schema, we need to use direct rpc call with type assertions
      const { data, error } = await supabase
        .rpc('move_entity_to_stage', { 
          entity_id: entityId, 
          entity_type: type, 
          target_stage_id: targetStageId 
        });
      
      if (error) throw error;
      
      const result = data as { success: boolean, message?: string, data?: any };
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to move item');
      }
      
      return result;
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
