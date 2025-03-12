
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
  updatedAt: dbDocument.updated_at
});

interface DocumentFilter {
  relatedEntityId?: string;
  relatedEntityType?: "lead" | "meeting";
  searchTerm?: string;
}

export function useDocuments(filter: DocumentFilter = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState(filter.searchTerm || '');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['documents', filter.relatedEntityId, filter.relatedEntityType, searchTerm, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase.from('documents').select('*');
      
      if (filter.relatedEntityId) {
        query = query.eq('related_entity_id', filter.relatedEntityId);
      }
      
      if (filter.relatedEntityType) {
        query = query.eq('related_entity_type', filter.relatedEntityType);
      }
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(convertDbDocumentToDocument);
    },
    enabled: !!user
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      relatedEntityId, 
      relatedEntityType 
    }: { 
      file: File, 
      relatedEntityId: string, 
      relatedEntityType: "lead" | "meeting" 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // 1. Upload file to storage
      const filePath = `${relatedEntityType}/${relatedEntityId}/${file.name}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // 2. Create document record in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id,
          related_entity_id: relatedEntityId,
          related_entity_type: relatedEntityType
        }]);
      
      if (dbError) {
        // If database insert fails, try to delete the uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (document: Document) => {
      // 1. Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.filePath]);
      
      if (storageError) throw storageError;
      
      // 2. Delete document record from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    }
  });

  const getDocumentUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60); // URL valid for 60 seconds
    
    if (error) {
      toast.error(`Failed to generate document URL: ${error.message}`);
      return null;
    }
    
    return data.signedUrl;
  };

  return {
    documents: data || [],
    isLoading,
    error,
    refetch,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    searchTerm,
    setSearchTerm
  };
}
