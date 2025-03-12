
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Nda, NdaStatus } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database NDA to frontend type
const convertDbNdaToNda = (dbNda: any): Nda => ({
  id: dbNda.id,
  opportunity_id: dbNda.opportunity_id,
  version: dbNda.version,
  status: dbNda.status,
  document_id: dbNda.document_id,
  issued_by: dbNda.issued_by,
  issued_at: dbNda.issued_at,
  signed_at: dbNda.signed_at,
  countersigned_at: dbNda.countersigned_at,
  completed_at: dbNda.completed_at,
  created_at: dbNda.created_at,
  updated_at: dbNda.updated_at
});

export function useNdas(opportunityId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNda, setSelectedNda] = useState<Nda | null>(null);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ndas', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ndas')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbNdaToNda);
    },
    enabled: !!opportunityId
  });

  const issueNda = useMutation({
    mutationFn: async ({ opportunity_id }: { opportunity_id: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Get latest version if exists
      const { data: existingNdas } = await supabase
        .from('ndas')
        .select('version')
        .eq('opportunity_id', opportunity_id)
        .order('version', { ascending: false })
        .limit(1);
      
      const nextVersion = existingNdas && existingNdas.length > 0 ? existingNdas[0].version + 1 : 1;
      
      // 2. Insert new NDA
      const { error } = await supabase
        .from('ndas')
        .insert([{
          opportunity_id,
          version: nextVersion,
          status: 'issued',
          issued_by: user.id,
          issued_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      // 3. Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          nda_status: 'issued'
        })
        .eq('id', opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA issued successfully');
    },
    onError: (error) => {
      toast.error(`Failed to issue NDA: ${error.message}`);
    }
  });

  const markNdaSigned = useMutation({
    mutationFn: async ({ ndaId }: { ndaId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the NDA details
      const { data: ndaData } = await supabase
        .from('ndas')
        .select('*')
        .eq('id', ndaId)
        .single();
      
      if (!ndaData) throw new Error('NDA not found');
      
      // Update NDA status
      const { error: updateError } = await supabase
        .from('ndas')
        .update({
          status: 'signed_by_investor',
          signed_at: new Date().toISOString()
        })
        .eq('id', ndaId);
      
      if (updateError) throw updateError;
      
      // Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          nda_status: 'signed_by_investor'
        })
        .eq('id', ndaData.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA marked as signed by investor');
    },
    onError: (error) => {
      toast.error(`Failed to update NDA status: ${error.message}`);
    }
  });

  const markNdaCounterSigned = useMutation({
    mutationFn: async ({ ndaId }: { ndaId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the NDA details
      const { data: ndaData } = await supabase
        .from('ndas')
        .select('*')
        .eq('id', ndaId)
        .single();
      
      if (!ndaData) throw new Error('NDA not found');
      
      // Update NDA status
      const { error: updateError } = await supabase
        .from('ndas')
        .update({
          status: 'counter_signed',
          countersigned_at: new Date().toISOString()
        })
        .eq('id', ndaId);
      
      if (updateError) throw updateError;
      
      // Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          nda_status: 'counter_signed'
        })
        .eq('id', ndaData.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA marked as counter-signed');
    },
    onError: (error) => {
      toast.error(`Failed to update NDA status: ${error.message}`);
    }
  });

  const markNdaCompleted = useMutation({
    mutationFn: async ({ ndaId }: { ndaId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the NDA details
      const { data: ndaData } = await supabase
        .from('ndas')
        .select('*')
        .eq('id', ndaId)
        .single();
      
      if (!ndaData) throw new Error('NDA not found');
      
      // Update NDA status
      const { error: updateError } = await supabase
        .from('ndas')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', ndaId);
      
      if (updateError) throw updateError;
      
      // Update opportunity status
      await supabase
        .from('opportunities')
        .update({
          nda_status: 'completed'
        })
        .eq('id', ndaData.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA marked as completed');
    },
    onError: (error) => {
      toast.error(`Failed to update NDA status: ${error.message}`);
    }
  });

  const uploadSignedNda = useMutation({
    mutationFn: async ({ ndaId, documentId }: { ndaId: string, documentId: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the NDA details
      const { data: ndaData } = await supabase
        .from('ndas')
        .select('*')
        .eq('id', ndaId)
        .single();
      
      if (!ndaData) throw new Error('NDA not found');
      
      // Update NDA with document
      const { error: updateError } = await supabase
        .from('ndas')
        .update({
          document_id: documentId
        })
        .eq('id', ndaId);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      toast.success('Signed NDA document uploaded');
    },
    onError: (error) => {
      toast.error(`Failed to upload signed NDA document: ${error.message}`);
    }
  });

  return {
    ndas: data || [],
    isLoading,
    error,
    refetch,
    issueNda,
    markNdaSigned,
    markNdaCounterSigned,
    markNdaCompleted,
    uploadSignedNda,
    selectedNda,
    setSelectedNda
  };
}
