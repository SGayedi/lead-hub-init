
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentList } from "@/components/DocumentList";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  const { documents, isLoading, refetch } = useDocuments({
    relatedEntityId: opportunityId,
    relatedEntityType: "opportunity"
  });
  
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      const documentToRemove = documents.find(doc => doc.id === documentToDelete);
      
      if (documentToRemove) {
        // First delete from storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([documentToRemove.filePath]);
          
        if (storageError) throw storageError;
        
        // Then delete from database
        const { error: dbError } = await supabase
          .from('documents')
          .delete()
          .eq('id', documentToDelete);
          
        if (dbError) throw dbError;
        
        toast.success("Document deleted successfully");
        refetch();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <DocumentUploader
        relatedEntityId={opportunityId}
        relatedEntityType="opportunity"
        onDocumentUploaded={() => refetch()}
      />
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
        <DocumentList 
          documents={documents || []} 
          isLoading={isLoading} 
          onDelete={(id) => setDocumentToDelete(id)}
        />
      </div>
      
      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
