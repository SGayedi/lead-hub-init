
import React, { useState } from 'react';
import { User, MessageSquare, Send, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { EntityType } from '@/types/crm';

interface CommentSectionProps {
  relatedEntityId: string;
  relatedEntityType: EntityType;
}

export function CommentSection({ 
  relatedEntityId,
  relatedEntityType
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  
  const { user } = useAuth();
  const { 
    comments, 
    isLoading, 
    addComment, 
    updateComment, 
    deleteComment 
  } = useComments({
    relatedEntityId,
    relatedEntityType
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment.mutate(newComment, {
      onSuccess: () => {
        setNewComment('');
      }
    });
  };
  
  const handleStartEditing = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditedContent(content);
  };
  
  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };
  
  const handleSaveEdit = (commentId: string) => {
    if (!editedContent.trim()) return;
    
    updateComment.mutate(
      { id: commentId, content: editedContent },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditedContent('');
        }
      }
    );
  };
  
  const handleDelete = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment.mutate(commentId);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold text-lg">Comments</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[60px]"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newComment.trim() || addComment.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">User</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                
                {user?.id === comment.createdBy && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleStartEditing(comment.id, comment.content)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[60px] mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCancelEditing}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editedContent.trim() || updateComment.isPending}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm">{comment.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
