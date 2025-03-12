
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileSignature, 
  Upload, 
  Download, 
  Clock, 
  CheckCircle,
  XCircle,
  FileCheck
} from "lucide-react";
import { useNdas } from "@/hooks/useNdas";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Spinner } from "@/components/Spinner";
import { NdaStatus } from "@/types/crm";

interface OpportunityNdaTabProps {
  opportunityId: string;
}

export function OpportunityNdaTab({ opportunityId }: OpportunityNdaTabProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [uploadType, setUploadType] = useState<"issue" | "signed" | "countersigned">("issue");
  
  const { 
    ndas, 
    isLoading, 
    issueNda, 
    updateNdaStatus 
  } = useNdas(opportunityId);
  
  const { 
    getDocumentUrl,
    previewDocumentVersion,
    previewUrl,
    previewDocument,
    clearPreview
  } = useDocuments();

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    try {
      if (uploadType === "issue") {
        await issueNda.mutateAsync({ opportunityId, file });
      } else if (uploadType === "signed" && ndas.length > 0) {
        await updateNdaStatus.mutateAsync({ 
          ndaId: ndas[0].id, 
          status: "signed_by_investor", 
          file 
        });
      } else if (uploadType === "countersigned" && ndas.length > 0) {
        await updateNdaStatus.mutateAsync({ 
          ndaId: ndas[0].id, 
          status: "counter_signed", 
          file 
        });
      }
      setShowUploader(false);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (ndas.length > 0) {
      await updateNdaStatus.mutateAsync({ 
        ndaId: ndas[0].id, 
        status: "completed" 
      });
    }
  };

  const handleDownload = async (ndaId: string) => {
    const nda = ndas.find(n => n.id === ndaId);
    if (!nda || !nda.document_id) return;
    
    try {
      const document = await previewDocumentVersion({
        id: nda.document_id,
        filePath: '',
        fileType: '',
        fileSize: 0,
        uploadedBy: '',
        relatedEntityId: opportunityId,
        relatedEntityType: 'lead',
        createdAt: '',
        updatedAt: '',
        version: 1
      });
      
      if (document) {
        window.open(document, '_blank');
      }
    } catch (error) {
      console.error("Failed to download NDA:", error);
    }
  };

  const renderNdaStatusAction = (status: NdaStatus) => {
    switch (status) {
      case "not_issued":
        return (
          <Button 
            onClick={() => {
              setUploadType("issue");
              setShowUploader(true);
            }}
          >
            <FileSignature className="h-4 w-4 mr-2" />
            Issue NDA
          </Button>
        );
      case "issued":
        return (
          <Button 
            onClick={() => {
              setUploadType("signed");
              setShowUploader(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Signed by Investor
          </Button>
        );
      case "signed_by_investor":
        return (
          <Button 
            onClick={() => {
              setUploadType("countersigned");
              setShowUploader(true);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Counter-signed
          </Button>
        );
      case "counter_signed":
        return (
          <Button onClick={handleMarkAsCompleted}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Completed
          </Button>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <FileCheck className="h-4 w-4 mr-1" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  const latestNda = ndas.length > 0 ? ndas[0] : null;
  const ndaStatus = latestNda?.status || "not_issued";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NDA Management</CardTitle>
          <CardDescription>
            Track and manage Non-Disclosure Agreements for this opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Current NDA Status</h3>
              <div className="flex items-center mt-2">
                <Badge className="text-sm" variant="outline">
                  {formatStatus(ndaStatus)}
                </Badge>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {renderNdaStatusAction(ndaStatus as NdaStatus)}
            </div>
          </div>

          {showUploader && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {uploadType === "issue" 
                    ? "Upload NDA Template" 
                    : uploadType === "signed" 
                      ? "Upload Investor Signed NDA" 
                      : "Upload Counter-signed NDA"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUploader 
                  onUpload={handleUpload}
                  onCancel={() => setShowUploader(false)}
                  acceptedFileTypes={['.pdf', '.doc', '.docx']}
                  maxFiles={1}
                />
              </CardContent>
            </Card>
          )}

          {ndas.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">NDA History</h3>
              <div className="space-y-4">
                {ndas.map((nda) => (
                  <Card key={nda.id} className="overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <FileSignature className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">
                            NDA Version {nda.version}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(nda.issued_at).toLocaleDateString()} - {formatStatus(nda.status)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownload(nda.id)}
                        disabled={!nda.document_id}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
