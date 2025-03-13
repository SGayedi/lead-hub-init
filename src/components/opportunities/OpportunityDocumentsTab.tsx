
import { useState } from "react";
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { FileText, Trash2, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  const { 
    documents, 
    isLoading, 
    deleteDocument, 
    getDocumentUrl,
    previewDocumentVersion,
    refetch 
  } = useDocuments({
    relatedEntityId: opportunityId,
    relatedEntityType: "opportunity"
  });

  const handleDeleteDocument = async (document: any) => {
    if (window.confirm(`Are you sure you want to delete ${document.name}?`)) {
      try {
        await deleteDocument.mutateAsync(document);
        toast.success('Document deleted successfully');
        // Explicitly refetch after deletion to ensure UI is updated
        await refetch();
      } catch (error: any) {
        console.error('Error deleting document:', error);
        toast.error(`Failed to delete document: ${error.message}`);
      }
    }
  };

  const handleViewDocument = async (document: any) => {
    const url = await previewDocumentVersion(document);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const url = await getDocumentUrl(document.filePath);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = document.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <DocumentUploader
        relatedEntityId={opportunityId}
        relatedEntityType="opportunity"
        onDocumentUploaded={() => refetch()}
      />
      
      {documents.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-lg font-medium">Documents</h3>
          {documents.map((document) => (
            <div 
              key={document.id} 
              className="border rounded-md p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{document.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(document.fileSize)} • {format(new Date(document.updatedAt || document.createdAt), 'PP')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleViewDocument(document)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDownloadDocument(document)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteDocument(document)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
