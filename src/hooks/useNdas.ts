
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Nda, NdaStatus, Document } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

const convertDbNdaToNda = (dbNda: any): Nda => ({
  id: dbNda.id,
  opportunity_id: dbNda.opportunity_id,
  version: dbNda.version,
  status: dbNda.status as NdaStatus,
  document_id: dbNda.document_id,
  issued_by: dbNda.issued_by,
  issued_at: dbNda.issued_at,
  signed_at: dbNda.signed_at,
  countersigned_at: dbNda.countersigned_at,
  completed_at: dbNda.completed_at,
  created_at: dbNda.created_at,
  updated_at: dbNda.updated_at
});

export function useNdas(opportunityId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNda, setSelectedNda] = useState<Nda | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ndas', opportunityId, user?.id],
    queryFn: async () => {
      if (!user || !opportunityId) return [];
      
      const { data, error } = await supabase
        .from('ndas')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbNdaToNda);
    },
    enabled: !!user && !!opportunityId
  });

  const createNda = useMutation({
    mutationFn: async ({ 
      opportunity_id, 
      document_id,
      status = 'issued'
    }: { 
      opportunity_id: string;
      document_id?: string;
      status?: NdaStatus;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const version = data && data.length > 0 ? data[0].version + 1 : 1;
      
      const { data: newNda, error } = await supabase
        .from('ndas')
        .insert({
          opportunity_id,
          version,
          status,
          document_id,
          issued_by: user.id,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return newNda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA created successfully');
    },
    onError: (error) => {
      console.error('Error creating NDA:', error);
      toast.error(`Failed to create NDA: ${error.message}`);
    }
  });
  
  const updateNdaStatus = useMutation({
    mutationFn: async ({ 
      ndaId, 
      status 
    }: { 
      ndaId: string; 
      status: NdaStatus;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const updateData: any = { status };
      
      if (status === 'signed_by_investor') {
        updateData.signed_at = new Date().toISOString();
      } else if (status === 'counter_signed') {
        updateData.countersigned_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      const { data: updatedNda, error } = await supabase
        .from('ndas')
        .update(updateData)
        .eq('id', ndaId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Also update the opportunity status
      if (opportunityId) {
        const { error: oppError } = await supabase
          .from('opportunities')
          .update({ nda_status: status })
          .eq('id', opportunityId);
        
        if (oppError) throw oppError;
      }
      
      return updatedNda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('NDA status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating NDA status:', error);
      toast.error(`Failed to update NDA status: ${error.message}`);
    }
  });
  
  const uploadNdaDocument = useMutation({
    mutationFn: async ({ 
      file, 
      opportunity_id,
      status = 'issued'
    }: { 
      file: File; 
      opportunity_id: string;
      status?: NdaStatus;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Upload file to storage
      const filePath = `opportunities/${opportunity_id}/ndas/${file.name}`;
      
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
      
      // 3. Create or update NDA
      const version = data && data.length > 0 ? data[0].version + 1 : 1;
      
      const { data: ndaData, error: ndaError } = await supabase
        .from('ndas')
        .insert({
          opportunity_id,
          version,
          status,
          document_id: documentData.id,
          issued_by: user.id,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (ndaError) {
        // If NDA creation fails, try to clean up
        await supabase.from('documents').delete().eq('id', documentData.id);
        await supabase.storage.from('documents').remove([filePath]);
        throw ndaError;
      }
      
      // 4. Update opportunity status
      const { error: oppError } = await supabase
        .from('opportunities')
        .update({
          nda_status: status
        })
        .eq('id', opportunity_id);
      
      if (oppError) throw oppError;
      
      return ndaData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ndas'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('NDA uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading NDA:', error);
      toast.error(`Failed to upload NDA: ${error.message}`);
    }
  });
  
  return {
    ndas: data || [],
    isLoading,
    error,
    refetch,
    createNda,
    updateNdaStatus,
    uploadNdaDocument,
    selectedNda,
    setSelectedNda
  };
}
