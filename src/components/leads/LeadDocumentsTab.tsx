
import { DocumentUploader } from "@/components/DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";

interface LeadDocumentsTabProps {
  leadId: string;
}

export function LeadDocumentsTab({ leadId }: LeadDocumentsTabProps) {
  const { refetch } = useDocuments({
    relatedEntityId: leadId,
    relatedEntityType: "lead"
  });

  return (
    <div className="space-y-4">
      <DocumentUploader 
        relatedEntityId={leadId} 
        relatedEntityType="lead"
        onDocumentUploaded={() => refetch()}
      />
    </div>
  );
}
