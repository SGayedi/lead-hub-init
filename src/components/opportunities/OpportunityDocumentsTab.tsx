
import { useState } from "react";
import { FileText, Trash2, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<any | null>(null);
  
  const { 
    documents, 
    isLoading, 
    deleteDocument, 
    getDocumentUrl,
    refetch 
  } = useDocuments({
    relatedEntityId: opportunityId,
    relatedEntityType: "opportunity"
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle document deletion with proper UI update
  const handleDeleteDocument = async (document: any) => {
    if (window.confirm(`Are you sure you want to delete ${document.name}?`)) {
      try {
        console.log("Deleting document:", document.id, document.filePath);
        await deleteDocument.mutateAsync(document);
        toast.success('Document deleted successfully');
        // Force refetch after successful deletion
        await refetch();
      } catch (error: any) {
        console.error("Error in OpportunityDocumentsTab deletion:", error);
        toast.error(`Failed to delete document: ${error.message}`);
      }
    }
  };

  const handleViewDocument = async (document: any) => {
    try {
      const url = await getDocumentUrl(document.filePath);
      if (url) {
        setPreviewDocument(document);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to generate preview URL');
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

  const renderFilePreview = () => {
    if (!previewUrl || !previewDocument) return null;
    
    const fileExtension = previewDocument.name.split('.').pop()?.toLowerCase();
    const isImage = fileExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{previewDocument.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(previewDocument.fileSize)} • {formatDate(previewDocument.createdAt)}
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleDownloadDocument(previewDocument)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
        
        {isImage ? (
          <img src={previewUrl} alt={previewDocument.name} className="max-w-full max-h-[60vh] rounded-md mx-auto" />
        ) : isPdf ? (
          <iframe src={previewUrl} className="w-full h-[70vh] rounded-md" title={previewDocument.name} />
        ) : (
          <div className="text-center p-10">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p>Preview not available for this file type</p>
            <Button 
              className="mt-4" 
              onClick={() => window.open(previewUrl, '_blank')}
            >
              Open in new tab
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DocumentUploader
        relatedEntityId={opportunityId}
        relatedEntityType="opportunity"
        onDocumentUploaded={() => refetch()}
      />
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border rounded-md p-8">
            No documents uploaded yet
          </div>
        ) : (
          <div className="space-y-2">
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
                      {formatFileSize(document.fileSize)} • {formatDate(document.createdAt)}
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

      <Dialog 
        open={!!previewUrl} 
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDocument(null);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {renderFilePreview()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
