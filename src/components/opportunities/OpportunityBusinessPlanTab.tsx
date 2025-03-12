
import { useState } from "react";
import { format } from "date-fns";
import { useBusinessPlans } from "@/hooks/useBusinessPlans";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";
import { Opportunity, BusinessPlanStatus } from "@/types/crm";

interface OpportunityBusinessPlanTabProps {
  opportunity: Opportunity;
}

export function OpportunityBusinessPlanTab({ opportunity }: OpportunityBusinessPlanTabProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const { 
    businessPlans, 
    isLoading, 
    requestBusinessPlan,
    approveBusinessPlan,
    rejectBusinessPlan,
    requestUpdates,
    uploadBusinessPlan
  } = useBusinessPlans(opportunity.id);
  
  const handleUploadComplete = () => {
    setShowUploader(false);
  };
  
  const handleSubmitFeedback = async () => {
    if (!selectedPlan) return;
    
    await requestUpdates.mutateAsync({
      businessPlanId: selectedPlan,
      feedback: notes
    });
    
    setNotes("");
    setSelectedPlan(null);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };
  
  const getStatusBadge = (status: BusinessPlanStatus) => {
    switch(status) {
      case "not_requested":
        return <Badge variant="outline" className="bg-gray-100">Not Requested</Badge>;
      case "requested":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Requested</Badge>;
      case "received":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Received</Badge>;
      case "updates_needed":
        return <Badge variant="outline" className="bg-amber-100 text-amber-700">Updates Needed</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    await uploadBusinessPlan.mutateAsync({
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
        <h3 className="text-lg font-semibold">Business Plan</h3>
        <div className="space-x-2">
          {opportunity.business_plan_status === "not_requested" && (
            <Button 
              size="sm" 
              onClick={() => requestBusinessPlan.mutate(opportunity.id)}
              disabled={requestBusinessPlan.isPending}
            >
              Request Business Plan
            </Button>
          )}
          
          {["not_requested", "updates_needed", "rejected"].includes(opportunity.business_plan_status) && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowUploader(true)}
            >
              Upload Business Plan
            </Button>
          )}
        </div>
      </div>
      
      {showUploader && (
        <div className="border p-4 rounded-md bg-muted/50">
          <h4 className="font-medium mb-2">Upload Business Plan</h4>
          <DocumentUploader 
            relatedEntityId={opportunity.id}
            relatedEntityType="opportunity"
            onUpload={handleUpload}
            onCancel={() => setShowUploader(false)}
            acceptedFileTypes={[".pdf", ".docx", ".doc", ".xlsx", ".xls", ".ppt", ".pptx"]}
            maxFiles={1}
          />
        </div>
      )}
      
      {opportunity.business_plan_status === "received" && (
        <div className="flex justify-end space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            className="flex items-center gap-1 text-red-500"
            onClick={() => rejectBusinessPlan.mutate(opportunity.id)}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-amber-500"
            onClick={() => setSelectedPlan(businessPlans[0]?.id)}
          >
            <RefreshCw className="h-4 w-4" />
            Request Updates
          </Button>
          <Button 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => approveBusinessPlan.mutate(opportunity.id)}
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
        </div>
      )}
      
      {selectedPlan && (
        <div className="border p-4 rounded-md bg-muted/50">
          <h4 className="font-medium mb-2">Request Updates</h4>
          <Textarea
            className="mb-2"
            placeholder="Provide feedback on what updates are needed..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedPlan(null)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSubmitFeedback}
              disabled={!notes.trim()}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : businessPlans && businessPlans.length > 0 ? (
        <div className="space-y-4">
          {businessPlans.map((plan) => (
            <div key={plan.id} className="p-4 border rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Business Plan v{plan.version}</span>
                    {getStatusBadge(plan.status as BusinessPlanStatus)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.received_at ? `Received on ${formatDate(plan.received_at)}` : 'No receive date'}
                  </p>
                  {plan.notes && (
                    <p className="mt-2 text-sm border-l-2 border-blue-300 pl-2">
                      {plan.notes}
                    </p>
                  )}
                  {plan.feedback && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Feedback:</p>
                      <p className="text-sm border-l-2 border-amber-300 pl-2">
                        {plan.feedback}
                      </p>
                    </div>
                  )}
                </div>
                {plan.document_id && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => plan.document_id && handleDownloadDocument(plan)}
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
          {opportunity.business_plan_status === "requested" 
            ? "Waiting for business plan from investor."
            : "No business plan available yet."}
        </div>
      )}
    </div>
  );
}
