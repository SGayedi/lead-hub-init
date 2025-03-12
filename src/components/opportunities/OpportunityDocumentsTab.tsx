
import { DocumentUploader } from "@/components/DocumentUploader";

interface OpportunityDocumentsTabProps {
  opportunityId: string;
}

export function OpportunityDocumentsTab({ opportunityId }: OpportunityDocumentsTabProps) {
  return (
    <div className="space-y-4">
      <DocumentUploader
        relatedEntityId={opportunityId}
        relatedEntityType="opportunity"
      />
    </div>
  );
}
