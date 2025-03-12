
import { useState } from "react";
import { format } from "date-fns";
import { useNdas } from "@/hooks/useNdas";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";
import { Opportunity, NdaStatus } from "@/types/crm";

interface OpportunityNdaTabProps {
  opportunity: Opportunity;
}

export function OpportunityNdaTab({ opportunity }: OpportunityNdaTabProps) {
  const [showUploader, setShowUploader] = useState(false);
  
  const { 
    ndas, 
    isLoading, 
    issueNda,
    markNdaSigned,
    markNdaCounterSigned,
    markNdaCompleted,
    uploadSignedNda
  } = useNdas(opportunity.id);
  
  const handleUploadComplete = () => {
    setShowUploader(false);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };
  
  const getStatusBadge = (status: NdaStatus) => {
    switch(status) {
      case "not_issued":
        return <Badge variant="outline" className="bg-gray-100">Not Issued</Badge>;
      case "issued":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Issued</Badge>;
      case "signed_by_investor":
        return <Badge variant="outline" className="bg-amber-100 text-amber-700">Signed by Investor</Badge>;
      case "counter_signed":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Counter-signed</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    await uploadSignedNda.mutateAsync({
      opportunityId: opportunity.id,
      file
    });
  };
  
  const handleDownloadDocument = async (document: any) => {
    try {
      const url = document.filePath;
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">NDA Management</h3>
        <div className="space-x-2">
          {opportunity.nda_status === "not_issued" && (
            <Button 
              size="sm" 
              onClick={() => issueNda.mutate(opportunity.id)}
              disabled={issueNda.isPending}
            >
              Issue NDA
            </Button>
          )}
          
          {opportunity.nda_status === "issued" && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowUploader(true)}
            >
              Upload Signed NDA
            </Button>
          )}
          
          {opportunity.nda_status === "signed_by_investor" && (
            <Button 
              size="sm"
              onClick={() => markNdaCounterSigned.mutate(opportunity.id)}
            >
              Mark as Counter-signed
            </Button>
          )}
          
          {opportunity.nda_status === "counter_signed" && (
            <Button 
              size="sm"
              onClick={() => markNdaCompleted.mutate(opportunity.id)}
            >
              Mark as Completed
            </Button>
          )}
        </div>
      </div>
      
      {showUploader && (
        <div className="border p-4 rounded-md bg-muted/50">
          <h4 className="font-medium mb-2">Upload Signed NDA</h4>
          <DocumentUploader 
            relatedEntityId={opportunity.id}
            relatedEntityType="opportunity"
            onUpload={handleUpload}
            onCancel={() => setShowUploader(false)}
            acceptedFileTypes={[".pdf", ".docx", ".doc"]}
            maxFiles={1}
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : ndas && ndas.length > 0 ? (
        <div className="space-y-4">
          {ndas.map((nda) => (
            <div key={nda.id} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">NDA v{nda.version}</span>
                    {getStatusBadge(nda.status as NdaStatus)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Issued on {formatDate(nda.issued_at)}
                  </p>
                  {nda.signed_at && (
                    <p className="text-sm text-muted-foreground">
                      Signed by investor on {formatDate(nda.signed_at)}
                    </p>
                  )}
                  {nda.countersigned_at && (
                    <p className="text-sm text-muted-foreground">
                      Counter-signed on {formatDate(nda.countersigned_at)}
                    </p>
                  )}
                  {nda.completed_at && (
                    <p className="text-sm text-muted-foreground">
                      Completed on {formatDate(nda.completed_at)}
                    </p>
                  )}
                </div>
                {nda.document_id && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => nda.document_id && handleDownloadDocument(nda)}
                  >
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No NDAs issued yet.
        </div>
      )}
    </div>
  );
}
