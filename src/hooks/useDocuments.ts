
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Document, EntityType } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database document to frontend Document type
const convertDbDocumentToDocument = (dbDocument: any): Document => ({
  id: dbDocument.id,
  name: dbDocument.name,
  filePath: dbDocument.file_path,
  fileType: dbDocument.file_type,
  fileSize: dbDocument.file_size,
  uploadedBy: dbDocument.uploaded_by,
  relatedEntityId: dbDocument.related_entity_id,
  relatedEntityType: dbDocument.related_entity_type,
  createdAt: dbDocument.created_at,
  updatedAt: dbDocument.updated_at,
  version: dbDocument.version,
  versionHistory: dbDocument.version_history
});

interface DocumentsFilter {
  relatedEntityId: string;
  relatedEntityType: EntityType;
}

export function useDocuments(filter: DocumentsFilter) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['documents', filter.relatedEntityId, filter.relatedEntityType];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('related_entity_id', filter.relatedEntityId)
        .eq('related_entity_type', filter.relatedEntityType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbDocumentToDocument);
    },
    enabled: !!user && !!filter.relatedEntityId && !!filter.relatedEntityType
  });

  const uploadDocument = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error('User not authenticated');
      
      const file = formData.get('file') as File;
      if (!file) throw new Error('No file provided');
      
      // Generate a unique file path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${filter.relatedEntityType}/${filter.relatedEntityId}/${timestamp}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create document record in database
      const { error: dbError } = await supabase.from('documents').insert([{
        name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
        related_entity_id: filter.relatedEntityId,
        related_entity_type: filter.relatedEntityType
      }]);
      
      if (dbError) throw dbError;
      
      return { filePath };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload document: ${error.message}`);
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // First get document details to get file path
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (docError) throw docError;
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docData.file_path]);
      
      if (storageError) throw storageError;
      
      // Delete document record from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      return { success: true, documentId };
    },
    onMutate: async (documentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKey });
      
      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData(queryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: Document[] | undefined) => {
        if (!old) return [];
        return old.filter(doc => doc.id !== documentId);
      });
      
      return { previousDocuments };
    },
    onSuccess: (_, documentId) => {
      toast.success('Document deleted successfully');
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(queryKey, context.previousDocuments);
      }
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKey });
    }
  });

  return {
    documents: data || [],
    isLoading,
    error,
    refetch,
    uploadDocument,
    deleteDocument
  };
}
