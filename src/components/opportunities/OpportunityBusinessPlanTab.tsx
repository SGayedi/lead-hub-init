
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
import { Textarea } from "@/components/ui/textarea";
import { 
  BarChart2, 
  Upload, 
  Download, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  FileCheck,
  Send
} from "lucide-react";
import { useBusinessPlans } from "@/hooks/useBusinessPlans";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Spinner } from "@/components/Spinner";
import { BusinessPlanStatus } from "@/types/crm";

interface OpportunityBusinessPlanTabProps {
  opportunityId: string;
}

export function OpportunityBusinessPlanTab({ opportunityId }: OpportunityBusinessPlanTabProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState("");
  
  const { 
    businessPlans, 
    isLoading, 
    requestBusinessPlan, 
    uploadBusinessPlan,
    updateBusinessPlanStatus
  } = useBusinessPlans(opportunityId);
  
  const { 
    getDocumentUrl,
    previewDocumentVersion
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
      await uploadBusinessPlan.mutateAsync({ opportunityId, file, notes });
      setShowUploader(false);
      setNotes("");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleRequestPlan = async () => {
    await requestBusinessPlan.mutateAsync(opportunityId);
  };

  const handleApprove = async () => {
    if (businessPlans.length > 0) {
      await updateBusinessPlanStatus.mutateAsync({
        businessPlanId: businessPlans[0].id,
        status: "approved"
      });
    }
  };

  const handleReject = () => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    if (businessPlans.length > 0 && feedback) {
      await updateBusinessPlanStatus.mutateAsync({
        businessPlanId: businessPlans[0].id,
        status: "updates_needed",
        feedback
      });
      setShowFeedback(false);
      setFeedback("");
    }
  };

  const handleDownload = async (businessPlanId: string) => {
    const businessPlan = businessPlans.find(bp => bp.id === businessPlanId);
    if (!businessPlan || !businessPlan.document_id) return;
    
    try {
      const document = await previewDocumentVersion({
        id: businessPlan.document_id,
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
      console.error("Failed to download Business Plan:", error);
    }
  };

  const renderBusinessPlanAction = (status: BusinessPlanStatus) => {
    switch (status) {
      case "not_requested":
        return (
          <Button onClick={handleRequestPlan}>
            <Send className="h-4 w-4 mr-2" />
            Request Business Plan
          </Button>
        );
      case "requested":
        return (
          <Button 
            onClick={() => setShowUploader(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Business Plan
          </Button>
        );
      case "received":
        return (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="default"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Request Updates
            </Button>
          </div>
        );
      case "updates_needed":
        return (
          <Button 
            onClick={() => setShowUploader(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Updated Plan
          </Button>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            <FileCheck className="h-4 w-4 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 px-3 py-1">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  const latestPlan = businessPlans.length > 0 ? businessPlans[0] : null;
  const businessPlanStatus = latestPlan?.status || "not_requested";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Plan Management</CardTitle>
          <CardDescription>
            Request, review, and manage business plans for this opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Current Status</h3>
              <div className="flex items-center mt-2">
                <Badge className="text-sm" variant="outline">
                  {formatStatus(businessPlanStatus)}
                </Badge>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {renderBusinessPlanAction(businessPlanStatus as BusinessPlanStatus)}
            </div>
          </div>

          {showUploader && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Upload Business Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Textarea
                    placeholder="Add notes about this business plan submission"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <DocumentUploader 
                  onUpload={handleUpload}
                  onCancel={() => setShowUploader(false)}
                  acceptedFileTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx']}
                  maxFiles={1}
                />
              </CardContent>
            </Card>
          )}

          {showFeedback && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Provide Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Textarea
                    placeholder="Enter feedback about why updates are needed..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedback("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitFeedback}>
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {latestPlan?.feedback && (
            <Card className="mb-6 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{latestPlan.feedback}</p>
              </CardContent>
            </Card>
          )}

          {businessPlans.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Business Plan History</h3>
              <div className="space-y-4">
                {businessPlans.map((plan) => (
                  <Card key={plan.id} className="overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <BarChart2 className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">
                            Business Plan Version {plan.version}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {plan.received_at ? new Date(plan.received_at).toLocaleDateString() : 'Not received'} 
                            - {formatStatus(plan.status)}
                          </div>
                          {plan.notes && (
                            <div className="text-sm mt-1">
                              {plan.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      {plan.document_id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(plan.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
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
