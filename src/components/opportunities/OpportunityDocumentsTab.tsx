
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  const { refetch } = useDocuments({
    relatedEntityId: opportunityId,
    relatedEntityType: "opportunity"
  });

  return (
    <div className="space-y-6">
      <DocumentUploader
        relatedEntityId={opportunityId}
        relatedEntityType="opportunity"
        onDocumentUploaded={() => refetch()}
      />
    </div>
  );
}
