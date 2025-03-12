
import { useState } from "react";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { Spinner } from "@/components/Spinner";
import { formatBytes } from "@/lib/utils";
import { Opportunity } from "@/types/crm";

interface OpportunityDocumentsTabProps {
  opportunity: Opportunity;
}

export function OpportunityDocumentsTab({ opportunity }: OpportunityDocumentsTabProps) {
  const { documents, isLoading } = useDocuments({
    relatedEntityId: opportunity.id,
    relatedEntityType: "opportunity"
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documents</h3>
      </div>

      <DocumentUploader 
        relatedEntityId={opportunity.id} 
        relatedEntityType="opportunity"
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(doc.fileSize)} • Uploaded on {formatDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No documents attached to this opportunity yet.
        </div>
      )}
    </div>
  );
}
