
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
  
  // Add state for document preview
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    mutationFn: async ({
      file,
      relatedEntityId,
      relatedEntityType,
      existingDocumentId
    }: {
      file: File;
      relatedEntityId: string;
      relatedEntityType: EntityType;
      existingDocumentId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      if (!file) throw new Error('No file provided');
      
      // Generate a unique file path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${relatedEntityType}/${relatedEntityId}/${timestamp}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      if (existingDocumentId) {
        // Update existing document with new version
        const { data: currentDoc, error: docError } = await supabase
          .from('documents')
          .select('version, file_path, version_history')
          .eq('id', existingDocumentId)
          .single();
        
        if (docError) throw docError;
        
        const newVersion = (currentDoc.version || 1) + 1;
        const versionHistory = currentDoc.version_history || [];
        
        // Add current version to history
        if (currentDoc.file_path) {
          versionHistory.push({
            path: currentDoc.file_path,
            version: currentDoc.version || 1,
            uploadedAt: new Date().toISOString(),
            size: file.size
          });
        }
        
        // Update document record with new version
        const { data: updatedDoc, error: updateError } = await supabase
          .from('documents')
          .update({
            name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            version: newVersion,
            version_history: versionHistory,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDocumentId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        return convertDbDocumentToDocument(updatedDoc);
      } else {
        // Create document record in database
        const { data: newDoc, error: dbError } = await supabase
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
          }])
          .select()
          .single();
        
        if (dbError) throw dbError;
        
        return convertDbDocumentToDocument(newDoc);
      }
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
    mutationFn: async (document: Document | string) => {
      if (!user) throw new Error('User not authenticated');
      
      const documentId = typeof document === 'string' ? document : document.id;
      const documentPath = typeof document === 'string' ? null : document.filePath;
      
      let filePath;
      
      // If document path not provided, get it from the database
      if (!documentPath) {
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .select('file_path, version_history')
          .eq('id', documentId)
          .single();
        
        if (docError) throw docError;
        
        filePath = docData.file_path;
        
        // Delete all versions from storage
        if (docData.version_history && docData.version_history.length > 0) {
          const pathsToDelete = docData.version_history.map((v: any) => v.path);
          
          // Add current version
          if (filePath) {
            pathsToDelete.push(filePath);
          }
          
          // Delete all versions
          for (const path of pathsToDelete) {
            const { error: storageError } = await supabase.storage
              .from('documents')
              .remove([path]);
            
            if (storageError) {
              console.error(`Error deleting version ${path}:`, storageError);
            }
          }
        } else if (filePath) {
          // Delete single file if no version history
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([filePath]);
          
          if (storageError) throw storageError;
        }
      } else {
        // Delete the file directly if path is provided
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([documentPath]);
        
        if (storageError) throw storageError;
      }
      
      // Delete document record from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      // Clear preview if deleted document is currently being previewed
      if (previewDocument && previewDocument.id === documentId) {
        clearPreview();
      }
      
      return { success: true, documentId };
    },
    onMutate: async (document) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKey });
      
      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData(queryKey);
      
      // Get document ID regardless of input type
      const documentId = typeof document === 'string' ? document : document.id;
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: Document[] | undefined) => {
        if (!old) return [];
        return old.filter(doc => doc.id !== documentId);
      });
      
      return { previousDocuments };
    },
    onSuccess: (_, document) => {
      const documentId = typeof document === 'string' ? document : document.id;
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

  // Function to get a document download URL
  const getDocumentUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 60); // 60 seconds expiry
    
    if (error) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to get document URL');
      return null;
    }
    
    return data.signedUrl;
  };

  // Function to preview a document
  const previewDocumentVersion = async (document: Document, versionPath?: string) => {
    try {
      setPreviewDocument(document);
      
      const path = versionPath || document.filePath;
      const url = await getDocumentUrl(path);
      
      if (url) {
        setPreviewUrl(url);
      } else {
        toast.error('Failed to generate preview URL');
      }
    } catch (error) {
      console.error('Error previewing document:', error);
      toast.error('Failed to preview document');
    }
  };

  // Function to clear document preview
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
    previewDocument,
    previewUrl,
    previewDocumentVersion,
    clearPreview
  };
}
