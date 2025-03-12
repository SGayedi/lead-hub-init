
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileIcon, 
  FileText,
  Download,
  Trash2,
  Eye
} from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Spinner } from "@/components/Spinner";
import { formatBytes } from "@/lib/utils";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  const [showUploader, setShowUploader] = useState(false);
  
  const { 
    documents, 
    isLoading, 
    uploadDocument, 
    deleteDocument,
    searchTerm,
    setSearchTerm,
    previewDocumentVersion,
    previewUrl,
    previewDocument,
    clearPreview
  } = useDocuments({
    relatedEntityId: opportunityId,
    relatedEntityType: "lead"
  });

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    for (const file of files) {
      await uploadDocument.mutateAsync({
        file,
        relatedEntityId: opportunityId,
        relatedEntityType: "lead"
      });
    }
    
    setShowUploader(false);
  };

  const handleDelete = async (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;
    
    const confirm = window.confirm(`Are you sure you want to delete "${document.name}"?`);
    if (confirm) {
      await deleteDocument.mutateAsync(document);
    }
  };

  const handlePreview = async (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (!document) return;
    
    const url = await previewDocumentVersion(document);
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Opportunity Documents</CardTitle>
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </CardHeader>
        <CardContent>
          {showUploader && (
            <div className="mb-6">
              <DocumentUploader 
                onUpload={handleUpload}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-2 text-lg font-medium">No documents yet</h3>
              <p className="text-muted-foreground mt-1">
                Upload documents related to this opportunity
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setShowUploader(true)}
              >
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((document) => (
                <div 
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(document.fileSize)} • {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handlePreview(document.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDelete(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
