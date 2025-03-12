
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BusinessPlan, BusinessPlanStatus, Document } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

const convertDbBusinessPlanToBusinessPlan = (dbPlan: any): BusinessPlan => ({
  id: dbPlan.id,
  opportunity_id: dbPlan.opportunity_id,
  version: dbPlan.version,
  status: dbPlan.status as BusinessPlanStatus,
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

export function useBusinessPlans(opportunityId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBusinessPlan, setSelectedBusinessPlan] = useState<BusinessPlan | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['businessPlans', opportunityId, user?.id],
    queryFn: async () => {
      if (!user || !opportunityId) return [];
      
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbBusinessPlanToBusinessPlan);
    },
    enabled: !!user && !!opportunityId
  });

  const createBusinessPlan = useMutation({
    mutationFn: async ({ 
      opportunity_id, 
      document_id,
      status = 'received',
      notes = '',
    }: { 
      opportunity_id: string;
      document_id?: string;
      status?: BusinessPlanStatus;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const version = data && data.length > 0 ? data[0].version + 1 : 1;
      
      const { data: newBusinessPlan, error } = await supabase
        .from('business_plans')
        .insert({
          opportunity_id,
          version,
          status,
          document_id,
          notes,
          received_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return newBusinessPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan created successfully');
    },
    onError: (error) => {
      console.error('Error creating business plan:', error);
      toast.error(`Failed to create business plan: ${error.message}`);
    }
  });
  
  const requestBusinessPlan = useMutation({
    mutationFn: async ({ 
      opportunity_id,
      notes = ''
    }: { 
      opportunity_id: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: updatedOpportunity, error } = await supabase
        .from('opportunities')
        .update({
          business_plan_status: 'requested',
          business_plan_notes: notes
        })
        .eq('id', opportunity_id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create a business plan record with 'requested' status
      const { data: newBusinessPlan, error: bpError } = await supabase
        .from('business_plans')
        .insert({
          opportunity_id,
          status: 'requested',
          notes,
          requested_by: user.id,
          requested_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (bpError) throw bpError;
      
      return { opportunity: updatedOpportunity, businessPlan: newBusinessPlan };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan requested successfully');
    },
    onError: (error) => {
      console.error('Error requesting business plan:', error);
      toast.error(`Failed to request business plan: ${error.message}`);
    }
  });
  
  const updateBusinessPlanStatus = useMutation({
    mutationFn: async ({ 
      businessPlanId, 
      status, 
      feedback = ''
    }: { 
      businessPlanId: string; 
      status: BusinessPlanStatus; 
      feedback?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const updateData: any = { status };
      
      if (status === 'approved') {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }
      
      if (feedback) {
        updateData.feedback = feedback;
      }
      
      const { data: updatedPlan, error } = await supabase
        .from('business_plans')
        .update(updateData)
        .eq('id', businessPlanId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Also update the opportunity status
      if (opportunityId) {
        const { error: oppError } = await supabase
          .from('opportunities')
          .update({ business_plan_status: status })
          .eq('id', opportunityId);
        
        if (oppError) throw oppError;
      }
      
      return updatedPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Business plan status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating business plan status:', error);
      toast.error(`Failed to update business plan status: ${error.message}`);
    }
  });
  
  const uploadBusinessPlanDocument = useMutation({
    mutationFn: async ({ 
      file, 
      opportunity_id,
      status = 'received',
      notes = ''
    }: { 
      file: File; 
      opportunity_id: string;
      status?: BusinessPlanStatus;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Upload file to storage
      const filePath = `opportunities/${opportunity_id}/business_plans/${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // 2. Create document record
      const { data: documentData, error: docError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id,
          related_entity_id: opportunity_id,
          related_entity_type: 'opportunity',
          version: 1
        })
        .select()
        .single();
      
      if (docError) {
        // If document creation fails, try to delete the uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw docError;
      }
      
      // 3. Create or update business plan
      const version = data && data.length > 0 ? data[0].version + 1 : 1;
      
      const { data: businessPlanData, error: bpError } = await supabase
        .from('business_plans')
        .insert({
          opportunity_id,
          version,
          status,
          document_id: documentData.id,
          notes,
          received_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (bpError) {
        // If business plan creation fails, try to clean up
        await supabase.from('documents').delete().eq('id', documentData.id);
        await supabase.storage.from('documents').remove([filePath]);
        throw bpError;
      }
      
      // 4. Update opportunity status
      const { error: oppError } = await supabase
        .from('opportunities')
        .update({
          business_plan_status: status
        })
        .eq('id', opportunity_id);
      
      if (oppError) throw oppError;
      
      return businessPlanData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessPlans'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Business plan uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading business plan:', error);
      toast.error(`Failed to upload business plan: ${error.message}`);
    }
  });
  
  return {
    businessPlans: data || [],
    isLoading,
    error,
    refetch,
    createBusinessPlan,
    requestBusinessPlan,
    updateBusinessPlanStatus,
    uploadBusinessPlanDocument,
    selectedBusinessPlan,
    setSelectedBusinessPlan
  };
}
