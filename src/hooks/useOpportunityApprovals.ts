
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface OpportunityApproval {
  id: string;
  opportunity_id: string;
  approved_by: string;
  approved_at: string;
  comments?: string;
  stage: string;
  is_final: boolean;
  approver_name?: string; // Joined from profiles
  created_at: string;
  updated_at: string;
}

export function useOpportunityApprovals(opportunityId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunity-approvals', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunity_approvals')
        .select(`
          *,
          profiles:approved_by (
            full_name
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our expected format
      return data.map(item => {
        const approverName = item.profiles ? item.profiles.full_name : undefined;
        return {
          ...item,
          approver_name: approverName
        } as OpportunityApproval;
      });
    },
    enabled: !!opportunityId
  });

  const createApproval = useMutation({
    mutationFn: async ({ 
      opportunityId, 
      stage, 
      isFinal, 
      comments 
    }: { 
      opportunityId: string; 
      stage: string; 
      isFinal: boolean;
      comments?: string;
    }) => {
      const { data, error } = await supabase
        .from('opportunity_approvals')
        .insert({
          opportunity_id: opportunityId,
          approved_by: user?.id,
          stage,
          is_final: isFinal,
          comments
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-approvals', opportunityId] });
      toast.success('Approval recorded successfully');
    },
    onError: (error) => {
      console.error('Error creating approval:', error);
      toast.error('Failed to record approval');
    }
  });

  return {
    approvals: data || [],
    isLoading,
    error,
    refetch,
    createApproval
  };
}
