
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/crm';
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
  relatedEntityType?: "lead" | "meeting" | "opportunity";
  searchTerm?: string;
}

// Define the return type for the upload mutation
interface UploadResult {
  id: string;
  [key: string]: any;
}

export function useDocuments(filter: DocumentFilter = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState(filter.searchTerm || '');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create a specific query key that includes all filter parameters
  const queryKey = ['documents', filter.relatedEntityId, filter.relatedEntityType, searchTerm, user?.id];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
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
      relatedEntityType: "lead" | "meeting" | "opportunity",
      existingDocumentId?: string
    }): Promise<UploadResult | null> => {
      if (!user) throw new Error('User not authenticated');
      
      try {
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
          const { error: uploadError, data: fileData } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }
          
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
            console.error("Update error:", updateError);
            await supabase.storage.from('documents').remove([filePath]);
            throw updateError;
          }
          
          // After successfully updating, return the document id
          return { id: existingDocumentId };
        } else {
          // Creating a new document
          const filePath = `${relatedEntityType}/${relatedEntityId}/${file.name}`;
          
          // 1. Upload file to storage
          const { error: uploadError, data: fileData } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw uploadError;
          }
          
          // 2. Create document record in database
          const { data: insertedData, error: dbError } = await supabase
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
            .select('id')
            .single();
          
          if (dbError) {
            // If database insert fails, try to delete the uploaded file
            console.error("Database error:", dbError);
            await supabase.storage.from('documents').remove([filePath]);
            throw dbError;
          }
          
          // Return the document id
          return insertedData;
        }
      } catch (error) {
        console.error("Document upload failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to upload document: ${error.message}`);
      console.error("Upload error details:", error);
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (document: Document) => {
      console.log("Deleting document:", document.id, document.filePath);
      
      // 1. Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.filePath]);
      
      if (storageError) {
        console.error("Storage deletion error:", storageError);
        throw storageError;
      }
      
      // Delete all version history files if they exist
      if (document.versionHistory && document.versionHistory.length > 0) {
        const paths = document.versionHistory.map(v => v.path);
        if (paths.length > 0) {
          const { error: historyError } = await supabase.storage
            .from('documents')
            .remove(paths);
            
          if (historyError) {
            console.warn("Error deleting version history files:", historyError);
            // Continue with database deletion even if history file deletion fails
          }
        }
      }
      
      // 2. Delete document record from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) {
        console.error("Database deletion error:", dbError);
        throw dbError;
      }
      
      console.log("Document successfully deleted");
      return document.id;
    },
    onSuccess: (deletedId) => {
      console.log("Invalidating documents query after deletion");
      // Invalidate using the exact same query key structure for proper cache invalidation
      queryClient.invalidateQueries({ queryKey });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      console.error("Document deletion failed:", error);
      toast.error(`Failed to delete document: ${error.message}`);
    }
  });

  const getDocumentUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60); // URL valid for 60 seconds
      
      if (error) {
        console.error("Signed URL error:", error);
        toast.error(`Failed to generate document URL: ${error.message}`);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return null;
    }
  };

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
