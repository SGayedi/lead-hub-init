
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  const { documents, isLoading, refetch, deleteDocument } = useDocuments({
    relatedEntityId: opportunityId,
    relatedEntityType: "opportunity"
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDownload = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(path);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  return (
    <div className="space-y-6">
      <DocumentUploader
        relatedEntityId={opportunityId}
        relatedEntityType="opportunity"
        onDocumentUploaded={() => refetch()}
      />
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Spinner />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents uploaded yet
        </div>
      ) : (
        <div className="grid gap-4 mt-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc.filePath, doc.name)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteDocument.isPending}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
