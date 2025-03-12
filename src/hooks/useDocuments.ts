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
  version: dbDocument.version || 1,
  versionHistory: dbDocument.version_history || []
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
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      relatedEntityType,
      existingDocumentId
    }: { 
      file: File, 
      relatedEntityId: string, 
      relatedEntityType: "lead" | "meeting",
      existingDocumentId?: string
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // If updating an existing document
      if (existingDocumentId) {
        const existingDoc = data?.find(d => d.id === existingDocumentId);
        if (!existingDoc) throw new Error('Document not found');
        
        // Get existing document details to create new version
        const newVersion = (existingDoc.version || 1) + 1;
        const fileName = file.name;
        const filePath = `${relatedEntityType}/${relatedEntityId}/${newVersion}_${fileName}`;
        
        // Store the old version information
        const oldVersionInfo = {
          version: existingDoc.version || 1,
          path: existingDoc.filePath,
          uploadedAt: existingDoc.updatedAt || existingDoc.createdAt,
          size: existingDoc.fileSize
        };
        
        const versionHistory = [...(existingDoc.versionHistory || []), oldVersionInfo];
        
        // 1. Upload the new version
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // 2. Update the document record
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            version: newVersion,
            version_history: versionHistory,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDocumentId);
        
        if (updateError) {
          // If database update fails, try to delete the uploaded file
          await supabase.storage.from('documents').remove([filePath]);
          throw updateError;
        }
      } else {
        // Creating a new document
        const filePath = `${relatedEntityType}/${relatedEntityId}/${file.name}`;
        
        // 1. Upload file to storage
        const { error: uploadError } = await supabase.storage
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
            related_entity_type: relatedEntityType,
            version: 1,
            version_history: []
          }]);
        
        if (dbError) {
          // If database insert fails, try to delete the uploaded file
          await supabase.storage.from('documents').remove([filePath]);
          throw dbError;
        }
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
      
      // Delete all version history files
      if (document.versionHistory && document.versionHistory.length > 0) {
        const paths = document.versionHistory.map(v => v.path);
        await supabase.storage.from('documents').remove(paths);
      }
      
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

  // Function to set up document preview
  const previewDocumentVersion = async (document: Document, versionPath?: string) => {
    try {
      const path = versionPath || document.filePath;
      const url = await getDocumentUrl(path);
      if (url) {
        setPreviewDocument(document);
        setPreviewUrl(url);
        return url;
      }
      return null;
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to generate preview URL');
      return null;
    }
  };

  // Clear preview
  const clearPreview = () => {
    setPreviewDocument(null);
    setPreviewUrl(null);
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
    setSearchTerm,
    previewDocument,
    previewUrl,
    previewDocumentVersion,
    clearPreview
  };
}
