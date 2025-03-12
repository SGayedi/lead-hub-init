
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BusinessPlan, BusinessPlanStatus } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useDocuments } from './useDocuments';

// Convert database business plan to frontend BusinessPlan type
const convertDbBusinessPlanToBusinessPlan = (dbBusinessPlan: any): BusinessPlan => ({
  id: dbBusinessPlan.id,
  opportunity_id: dbBusinessPlan.opportunity_id,
  version: dbBusinessPlan.version,
  status: dbBusinessPlan.status,
  document_id: dbBusinessPlan.document_id,
  notes: dbBusinessPlan.notes,
  requested_by: dbBusinessPlan.requested_by,
  requested_at: dbBusinessPlan.requested_at,
  received_at: dbBusinessPlan.received_at,
  feedback: dbBusinessPlan.feedback,
  approved_by: dbBusinessPlan.approved_by,
  approved_at: dbBusinessPlan.approved_at,
  created_at: dbBusinessPlan.created_at,
  updated_at: dbBusinessPlan.updated_at
});

export function useBusinessPlans(opportunityId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { uploadDocument } = useDocuments();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['business_plans', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbBusinessPlanToBusinessPlan);
    },
    enabled: !!opportunityId
  });

  const requestBusinessPlan = useMutation({
    mutationFn: async (opportunityId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Create business plan request record
      const { data, error } = await supabase
        .from('business_plans')
        .insert([{
          opportunity_id: opportunityId,
          version: 1,
          status: 'requested',
          requested_by: user.id,
          requested_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      
      // Update opportunity business plan status
      await supabase
        .from('opportunities')
        .update({ business_plan_status: 'requested' })
        .eq('id', opportunityId);
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan requested successfully');
    },
    onError: (error) => {
      console.error('Error requesting business plan:', error);
      toast.error('Failed to request business plan');
    }
  });

  const uploadBusinessPlan = useMutation({
    mutationFn: async ({ opportunityId, file, notes }: { opportunityId: string, file: File, notes?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the latest version
      const { data: latestPlan, error: planError } = await supabase
        .from('business_plans')
        .select('version')
        .eq('opportunity_id', opportunityId)
        .order('version', { ascending: false })
        .limit(1);
      
      const newVersion = latestPlan && latestPlan.length > 0 ? latestPlan[0].version + 1 : 1;
      
      // Upload document
      const documentId = await uploadDocument.mutateAsync({
        file, 
        relatedEntityId: opportunityId, 
        relatedEntityType: 'lead'
      });
      
      // Create business plan record
      const { data, error } = await supabase
        .from('business_plans')
        .insert([{
          opportunity_id: opportunityId,
          version: newVersion,
          status: 'received',
          document_id: documentId,
          notes,
          received_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      
      // Update opportunity business plan status
      await supabase
        .from('opportunities')
        .update({ 
          business_plan_status: 'received',
          business_plan_notes: notes 
        })
        .eq('id', opportunityId);
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading business plan:', error);
      toast.error('Failed to upload business plan');
    }
  });

  const updateBusinessPlanStatus = useMutation({
    mutationFn: async ({ 
      businessPlanId, 
      status, 
      feedback 
    }: { 
      businessPlanId: string, 
      status: BusinessPlanStatus, 
      feedback?: string 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const businessPlan = data?.find(bp => bp.id === businessPlanId);
      if (!businessPlan) throw new Error('Business plan not found');
      
      const updateData: any = { status };
      
      if (feedback) {
        updateData.feedback = feedback;
      }
      
      // Set appropriate timestamp based on status
      if (status === 'approved') {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }
      
      // Update business plan record
      const { error } = await supabase
        .from('business_plans')
        .update(updateData)
        .eq('id', businessPlanId);
      
      if (error) throw error;
      
      // Update opportunity business plan status
      await supabase
        .from('opportunities')
        .update({ 
          business_plan_status: status,
          business_plan_notes: feedback || businessPlan.notes 
        })
        .eq('id', businessPlan.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating business plan status:', error);
      toast.error('Failed to update business plan status');
    }
  });

  return {
    businessPlans: data || [],
    isLoading,
    error,
    refetch,
    requestBusinessPlan,
    uploadBusinessPlan,
    updateBusinessPlanStatus
  };
}
