
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/crm';

// Function to convert database lead to frontend Lead type
const convertDbLeadToLead = (dbLead: any): Lead => ({
  id: dbLead.id,
  name: dbLead.name,
  inquiryType: dbLead.inquiry_type,
  priority: dbLead.priority,
  source: dbLead.source,
  status: dbLead.status,
  exportQuota: dbLead.export_quota,
  plotSize: dbLead.plot_size,
  email: dbLead.email,
  phone: dbLead.phone,
  notes: dbLead.notes,
  outlookEmailId: dbLead.outlook_email_id,
  createdAt: dbLead.created_at,
  updatedAt: dbLead.updated_at
});

export function useLeads(status: LeadStatus | 'all' = 'all') {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', status, searchTerm],
    queryFn: async () => {
      let query = supabase.from('leads').select('*');
      
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert database leads to frontend Lead type
      return data.map(convertDbLeadToLead);
    }
  });

  return {
    leads: data || [],
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm
  };
}
