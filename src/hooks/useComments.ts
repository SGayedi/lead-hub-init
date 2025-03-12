
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment, EntityType } from '@/types/crm';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

// Convert database comment to frontend Comment type
const convertDbCommentToComment = (dbComment: any): Comment => ({
  id: dbComment.id,
  content: dbComment.content,
  createdBy: dbComment.created_by,
  relatedEntityId: dbComment.related_entity_id,
  relatedEntityType: dbComment.related_entity_type,
  createdAt: dbComment.created_at,
  updatedAt: dbComment.updated_at
});

interface CommentsFilter {
  relatedEntityId: string;
  relatedEntityType: EntityType;
}

export function useComments(filter: CommentsFilter) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['comments', filter.relatedEntityId, filter.relatedEntityType],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:created_by(full_name, email)')
        .eq('related_entity_id', filter.relatedEntityId)
        .eq('related_entity_type', filter.relatedEntityType)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map(convertDbCommentToComment);
    },
    enabled: !!user && !!filter.relatedEntityId && !!filter.relatedEntityType
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('comments')
        .insert([{
          content,
          created_by: user.id,
          related_entity_id: filter.relatedEntityId,
          related_entity_type: filter.relatedEntityType
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', filter.relatedEntityId, filter.relatedEntityType] 
      });
      toast.success('Comment added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    }
  });

  const updateComment = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', filter.relatedEntityId, filter.relatedEntityType] 
      });
      toast.success('Comment updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update comment: ${error.message}`);
    }
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', filter.relatedEntityId, filter.relatedEntityType] 
      });
      toast.success('Comment deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    }
  });

  return {
    comments: data || [],
    isLoading,
    error,
    refetch,
    addComment,
    updateComment,
    deleteComment
  };
}
