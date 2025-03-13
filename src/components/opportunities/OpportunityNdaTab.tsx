
import { useState } from "react";
import { useNdas } from "@/hooks/useNdas";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentUploader } from "@/components/DocumentUploader";
import { NdaStatus, Opportunity } from "@/types/crm";
import { format } from "date-fns";
import { toast } from "sonner";

interface OpportunityNdaTabProps {
  opportunity: Opportunity;
}

export function OpportunityNdaTab({ opportunity }: OpportunityNdaTabProps) {
  const opportunityId = opportunity.id;
  
  const {
    ndas,
    isLoading,
    issueNda,
    markNdaSigned,
    markNdaCounterSigned,
    markNdaCompleted,
    uploadSignedNda,
    selectedNda,
    setSelectedNda
  } = useNdas(opportunityId);

  const latestNda = ndas.length > 0 ? ndas[0] : null;

  const handleUploadSignedNda = (documentId: string) => {
    if (latestNda) {
      uploadSignedNda.mutate({ 
        ndaId: latestNda.id,
        documentId 
      });
      
      // Automatically mark the NDA as signed once document is uploaded
      markNdaSigned.mutate({ ndaId: latestNda.id });
    }
  };

  const handleIssueNda = () => {
    issueNda.mutate({ opportunity_id: opportunityId });
  };

  const handleMarkSigned = (ndaId: string) => {
    markNdaSigned.mutate({ ndaId });
  };

  const handleMarkCounterSigned = (ndaId: string) => {
    markNdaCounterSigned.mutate({ ndaId });
  };

  const getNdaStatusBadge = (status: NdaStatus) => {
    switch (status) {
      case "not_issued":
        return <Badge variant="outline">Not Issued</Badge>;
      case "issued":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Issued</Badge>;
      case "signed_by_investor":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Signed by Investor</Badge>;
      case "counter_signed":
        return <Badge variant="outline" className="bg-green-500 text-white">Counter Signed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-600 text-white">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Non-Disclosure Agreement (NDA)</h3>
        {!latestNda && (
          <Button onClick={handleIssueNda} disabled={issueNda.isPending}>
            Issue NDA
          </Button>
        )}
      </div>

      {latestNda ? (
        <div className="border rounded-md p-4 bg-card">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">Status</p>
                {getNdaStatusBadge(latestNda.status)}
              </div>

              <div>
                <p className="text-sm font-medium">Version</p>
                <span>{latestNda.version}</span>
              </div>
            </div>

            {latestNda.issued_at && (
              <div>
                <p className="text-sm font-medium">Issued</p>
                <p className="text-sm">
                  {format(new Date(latestNda.issued_at), "PPp")}
                </p>
              </div>
            )}

            {latestNda.signed_at && (
              <div>
                <p className="text-sm font-medium">Signed by Investor</p>
                <p className="text-sm">
                  {format(new Date(latestNda.signed_at), "PPp")}
                </p>
              </div>
            )}

            {latestNda.countersigned_at && (
              <div>
                <p className="text-sm font-medium">Counter Signed</p>
                <p className="text-sm">
                  {format(new Date(latestNda.countersigned_at), "PPp")}
                </p>
              </div>
            )}

            {(latestNda.status === "issued" || latestNda.status === "signed_by_investor") && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Upload Signed NDA</h4>
                <DocumentUploader
                  relatedEntityId={opportunityId}
                  relatedEntityType="opportunity"
                  onDocumentUploaded={handleUploadSignedNda}
                />
                {latestNda.status === "issued" && latestNda.document_id && (
                  <Button 
                    onClick={() => handleMarkSigned(latestNda.id)} 
                    className="mt-4 bg-green-600 hover:bg-green-700"
                  >
                    Mark as Signed by Investor
                  </Button>
                )}
              </div>
            )}

            {latestNda.status === "signed_by_investor" && (
              <div className="pt-4 border-t">
                <Button onClick={() => handleMarkCounterSigned(latestNda.id)} className="bg-green-600 hover:bg-green-700">
                  Mark as Counter Signed
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex p-8 justify-center items-center rounded-md border bg-muted/40">
          <p className="text-muted-foreground">No NDA has been issued yet.</p>
        </div>
      )}
    </div>
  );
}
