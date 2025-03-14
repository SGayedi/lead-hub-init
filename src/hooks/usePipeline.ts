
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
      // Use a more generic approach with fetch() for custom RPC functions
      const { data, error } = await supabase
        .from('rpc')
        .select('*')
        .eq('name', 'get_pipeline_stages')
        .eq('params.type_param', type)
        .single();
      
      if (error) throw error;
      
      return data as unknown as PipelineStage[];
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
      // Use a more generic approach with fetch() for custom RPC functions
      const { data, error } = await supabase
        .from('rpc')
        .select('*')
        .eq('name', 'get_pipeline_items')
        .eq('params.type_param', type)
        .single();
      
      if (error) throw error;
      
      let result = data as unknown as PipelineColumn[];
      
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
      // Use a more generic approach with fetch() for custom RPC functions
      const { data, error } = await supabase
        .from('rpc')
        .select('*')
        .eq('name', 'move_entity_to_stage')
        .eq('params.entity_id', entityId)
        .eq('params.entity_type', type)
        .eq('params.target_stage_id', targetStageId)
        .single();
      
      if (error) throw error;
      
      const result = data as unknown as { success: boolean, message?: string, data?: any };
      
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
