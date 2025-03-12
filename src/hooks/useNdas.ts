
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Nda, NdaStatus } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useDocuments } from './useDocuments';

// Convert database NDA to frontend Nda type
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
  const { uploadDocument } = useDocuments();

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
    mutationFn: async ({ opportunityId, file }: { opportunityId: string, file: File }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the latest version
      const { data: latestNda, error: ndaError } = await supabase
        .from('ndas')
        .select('version')
        .eq('opportunity_id', opportunityId)
        .order('version', { ascending: false })
        .limit(1);
      
      const newVersion = latestNda && latestNda.length > 0 ? latestNda[0].version + 1 : 1;
      
      // Upload document
      const documentUploadResult = await uploadDocument.mutateAsync({
        file, 
        relatedEntityId: opportunityId, 
        relatedEntityType: 'lead'
      });
      
      // Create NDA record
      const { data, error } = await supabase
        .from('ndas')
        .insert([{
          opportunity_id: opportunityId,
          version: newVersion,
          status: 'issued',
          document_id: documentUploadResult,
          issued_by: user.id,
          issued_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      
      // Update opportunity NDA status
      await supabase
        .from('opportunities')
        .update({ nda_status: 'issued' })
        .eq('id', opportunityId);
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA issued successfully');
    },
    onError: (error) => {
      console.error('Error issuing NDA:', error);
      toast.error('Failed to issue NDA');
    }
  });

  const updateNdaStatus = useMutation({
    mutationFn: async ({ ndaId, status, file }: { ndaId: string, status: NdaStatus, file?: File }) => {
      if (!user) throw new Error('User not authenticated');
      
      const nda = data?.find(n => n.id === ndaId);
      if (!nda) throw new Error('NDA not found');
      
      const updateData: any = { status };
      
      // Set appropriate timestamp based on status
      if (status === 'signed_by_investor') {
        updateData.signed_at = new Date().toISOString();
        
        // If a signed document was uploaded
        if (file) {
          const documentId = await uploadDocument.mutateAsync({
            file,
            relatedEntityId: nda.opportunity_id,
            relatedEntityType: 'lead',
            existingDocumentId: nda.document_id
          });
          updateData.document_id = documentId;
        }
      } else if (status === 'counter_signed') {
        updateData.countersigned_at = new Date().toISOString();
        
        // If a countersigned document was uploaded
        if (file) {
          const documentId = await uploadDocument.mutateAsync({
            file,
            relatedEntityId: nda.opportunity_id,
            relatedEntityType: 'lead',
            existingDocumentId: nda.document_id
          });
          updateData.document_id = documentId;
        }
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      // Update NDA record
      const { error } = await supabase
        .from('ndas')
        .update(updateData)
        .eq('id', ndaId);
      
      if (error) throw error;
      
      // Update opportunity NDA status
      await supabase
        .from('opportunities')
        .update({ nda_status: status })
        .eq('id', nda.opportunity_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating NDA status:', error);
      toast.error('Failed to update NDA status');
    }
  });

  return {
    ndas: data || [],
    isLoading,
    error,
    refetch,
    issueNda,
    updateNdaStatus
  };
}
