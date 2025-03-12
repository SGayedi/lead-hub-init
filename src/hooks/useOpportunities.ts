
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, OpportunityStatus, Lead } from '@/types/crm';
import { toast } from 'sonner';

// Helper function to convert database opportunity to frontend type
const convertDbOpportunityToOpportunity = (dbOpportunity: any): Opportunity => ({
  id: dbOpportunity.id,
  lead_id: dbOpportunity.lead_id,
  lead: dbOpportunity.leads ? {
    id: dbOpportunity.leads.id,
    name: dbOpportunity.leads.name,
    inquiry_type: dbOpportunity.leads.inquiry_type,
    priority: dbOpportunity.leads.priority,
    source: dbOpportunity.leads.source,
    status: dbOpportunity.leads.status,
    email: dbOpportunity.leads.email,
    phone: dbOpportunity.leads.phone,
    export_quota: dbOpportunity.leads.export_quota,
    plot_size: dbOpportunity.leads.plot_size,
    notes: dbOpportunity.leads.notes,
    created_at: dbOpportunity.leads.created_at,
    updated_at: dbOpportunity.leads.updated_at
  } : undefined,
  status: dbOpportunity.status,
  nda_status: dbOpportunity.nda_status,
  business_plan_status: dbOpportunity.business_plan_status,
  business_plan_notes: dbOpportunity.business_plan_notes,
  site_visit_scheduled: dbOpportunity.site_visit_scheduled,
  site_visit_date: dbOpportunity.site_visit_date,
  site_visit_notes: dbOpportunity.site_visit_notes,
  created_at: dbOpportunity.created_at,
  updated_at: dbOpportunity.updated_at
});

export function useOpportunities(status: OpportunityStatus | 'all' = 'all') {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['opportunities', status, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select('*, leads(*)');
      
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      if (searchTerm && searchTerm.length > 0) {
        query = query.textSearch('leads.name', searchTerm);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbOpportunityToOpportunity);
    }
  });

  const convertLeadToOpportunity = useMutation({
    mutationFn: async (leadId: string) => {
      const { data, error } = await supabase
        .rpc('convert_lead_to_opportunity', { lead_id_param: leadId });
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (opportunityId) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead converted to opportunity successfully');
      return opportunityId;
    },
    onError: (error) => {
      console.error('Error converting lead to opportunity:', error);
      toast.error('Failed to convert lead to opportunity');
    }
  });

  const updateOpportunityStatus = useMutation({
    mutationFn: async ({ opportunityId, status }: { opportunityId: string, status: OpportunityStatus }) => {
      const { error } = await supabase
        .from('opportunities')
        .update({ status })
        .eq('id', opportunityId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Opportunity status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating opportunity status:', error);
      toast.error('Failed to update opportunity status');
    }
  });

  return {
    opportunities: data || [],
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    convertLeadToOpportunity,
    updateOpportunityStatus
  };
}
