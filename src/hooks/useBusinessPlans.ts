
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BusinessPlan, BusinessPlanStatus } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database business plan to frontend type
const convertDbBusinessPlanToBusinessPlan = (dbPlan: any): BusinessPlan => ({
  id: dbPlan.id,
  opportunity_id: dbPlan.opportunity_id,
  version: dbPlan.version,
  status: dbPlan.status,
  document_id: dbPlan.document_id,
  notes: dbPlan.notes,
  requested_by: dbPlan.requested_by,
  requested_at: dbPlan.requested_at,
  received_at: dbPlan.received_at,
  feedback: dbPlan.feedback,
  approved_by: dbPlan.approved_by,
  approved_at: dbPlan.approved_at,
  created_at: dbPlan.created_at,
  updated_at: dbPlan.updated_at
});

export function useBusinessPlans(opportunityId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBusinessPlan, setSelectedBusinessPlan] = useState<BusinessPlan | null>(null);
  
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
    mutationFn: async ({ opportunity_id, notes }: { opportunity_id: string, notes?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Get latest version if exists
      const { data: existingPlans } = await supabase
        .from('business_plans')
        .select('version')
        .eq('opportunity_id', opportunity_id)
        .order('version', { ascending: false })
        .limit(1);
      
      const nextVersion = existingPlans && existingPlans.length > 0 ? existingPlans[0].version + 1 : 1;
      
      // 2. Insert new plan
      const { error } = await supabase
        .from('business_plans')
        .insert([{
          opportunity_id,
          version: nextVersion,
          status: 'requested',
          requested_by: user.id,
          requested_at: new Date().toISOString(),
          notes
        }]);
      
      if (error) throw error;
      
      // 3. Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          business_plan_status: 'requested',
          business_plan_notes: notes
        })
        .eq('id', opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan requested successfully');
    },
    onError: (error) => {
      toast.error(`Failed to request business plan: ${error.message}`);
    }
  });

  const approveBusinessPlan = useMutation({
    mutationFn: async ({ businessPlanId }: { businessPlanId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the business plan details
      const { data: planData } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', businessPlanId)
        .single();
      
      if (!planData) throw new Error('Business plan not found');
      
      // Update business plan status
      const { error: updateError } = await supabase
        .from('business_plans')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', businessPlanId);
      
      if (updateError) throw updateError;
      
      // Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          business_plan_status: 'approved'
        })
        .eq('id', planData.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan approved');
    },
    onError: (error) => {
      toast.error(`Failed to approve business plan: ${error.message}`);
    }
  });

  const rejectBusinessPlan = useMutation({
    mutationFn: async ({ businessPlanId, feedback }: { businessPlanId: string, feedback: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the business plan details
      const { data: planData } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', businessPlanId)
        .single();
      
      if (!planData) throw new Error('Business plan not found');
      
      // Update business plan status
      const { error: updateError } = await supabase
        .from('business_plans')
        .update({
          status: 'rejected',
          feedback
        })
        .eq('id', businessPlanId);
      
      if (updateError) throw updateError;
      
      // Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          business_plan_status: 'rejected'
        })
        .eq('id', planData.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan rejected');
    },
    onError: (error) => {
      toast.error(`Failed to reject business plan: ${error.message}`);
    }
  });

  const requestUpdates = useMutation({
    mutationFn: async ({ businessPlanId, feedback }: { businessPlanId: string, feedback: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the business plan details
      const { data: planData } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', businessPlanId)
        .single();
      
      if (!planData) throw new Error('Business plan not found');
      
      // Update business plan status
      const { error: updateError } = await supabase
        .from('business_plans')
        .update({
          status: 'updates_needed',
          feedback
        })
        .eq('id', businessPlanId);
      
      if (updateError) throw updateError;
      
      // Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          business_plan_status: 'updates_needed'
        })
        .eq('id', planData.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Updates requested for business plan');
    },
    onError: (error) => {
      toast.error(`Failed to request updates: ${error.message}`);
    }
  });

  const uploadBusinessPlan = useMutation({
    mutationFn: async ({ businessPlanId, documentId }: { businessPlanId: string, documentId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the business plan details
      const { data: planData } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', businessPlanId)
        .single();
      
      if (!planData) throw new Error('Business plan not found');
      
      // Update business plan with document
      const { error: updateError } = await supabase
        .from('business_plans')
        .update({
          document_id: documentId,
          status: 'received',
          received_at: new Date().toISOString()
        })
        .eq('id', businessPlanId);
      
      if (updateError) throw updateError;
      
      // Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          business_plan_status: 'received'
        })
        .eq('id', planData.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_plans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan document uploaded');
    },
    onError: (error) => {
      toast.error(`Failed to upload business plan document: ${error.message}`);
    }
  });

  return {
    businessPlans: data || [],
    isLoading,
    error,
    refetch,
    requestBusinessPlan,
    approveBusinessPlan,
    rejectBusinessPlan,
    requestUpdates,
    uploadBusinessPlan,
    selectedBusinessPlan,
    setSelectedBusinessPlan
  };
}
