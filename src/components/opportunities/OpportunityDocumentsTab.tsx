
import { useState } from "react";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { Spinner } from "@/components/Spinner";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  const { documents, isLoading, deleteDocument, refetch } = useDocuments({
    relatedEntityId: opportunityId,
    relatedEntityType: "opportunity"
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  // Handle document deletion with proper UI update
  const handleDeleteDocument = async (document: any) => {
    try {
      await deleteDocument.mutateAsync(document);
      // Force refetch after successful deletion
      await refetch();
    } catch (error) {
      console.error("Error in OpportunityDocumentsTab deletion:", error);
    }
  };

  return (
    <div className="space-y-4">
      <DocumentUploader
        relatedEntityId={opportunityId}
        relatedEntityType="opportunity"
        onDocumentUploaded={() => refetch()}
      />
    </div>
  );
}
