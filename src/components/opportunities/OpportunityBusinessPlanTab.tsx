
import { useState } from "react";
import { useBusinessPlans } from "@/hooks/useBusinessPlans";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusColorClass } from "@/lib/utils";
import { DocumentUploader } from "@/components/DocumentUploader";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BusinessPlanStatus } from "@/types/crm";
import { format } from "date-fns";

interface OpportunityBusinessPlanTabProps {
  opportunityId: string;
}

export function OpportunityBusinessPlanTab({ opportunityId }: OpportunityBusinessPlanTabProps) {
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [action, setAction] = useState<"request_updates" | "reject" | null>(null);
  
  const {
    businessPlans,
    isLoading,
    requestBusinessPlan,
    approveBusinessPlan,
    rejectBusinessPlan,
    requestUpdates,
    uploadBusinessPlan,
    selectedBusinessPlan,
    setSelectedBusinessPlan
  } = useBusinessPlans(opportunityId);
  
  const latestBusinessPlan = businessPlans.length > 0 ? businessPlans[0] : null;
  
  const handleRequestBusinessPlan = () => {
    requestBusinessPlan.mutate({ opportunity_id: opportunityId });
  };

  const handleUploadFiles = async (files: File[]) => {
    if (latestBusinessPlan && files.length > 0) {
      const file = files[0];
      uploadBusinessPlan.mutate({ 
        businessPlanId: latestBusinessPlan.id, 
        documentId: file.name // This will be replaced with actual document ID after upload
      });
    }
  };
  
  const handleApproveBusinessPlan = () => {
    if (latestBusinessPlan) {
      approveBusinessPlan.mutate({ businessPlanId: latestBusinessPlan.id });
    }
  };
  
  const handleReject = () => {
    setAction("reject");
    setShowFeedbackDialog(true);
  };
  
  const handleRequestUpdates = () => {
    setAction("request_updates");
    setShowFeedbackDialog(true);
  };
  
  const handleSubmitFeedback = () => {
    if (!latestBusinessPlan) return;
    
    if (action === "reject") {
      rejectBusinessPlan.mutate({ 
        businessPlanId: latestBusinessPlan.id, 
        feedback 
      });
    } else if (action === "request_updates") {
      requestUpdates.mutate({ 
        businessPlanId: latestBusinessPlan.id, 
        feedback 
      });
    }
    
    setShowFeedbackDialog(false);
    setFeedback("");
    setAction(null);
  };
  
  const handleDocumentUploaded = (documentId: string) => {
    if (latestBusinessPlan) {
      uploadBusinessPlan.mutate({ 
        businessPlanId: latestBusinessPlan.id, 
        documentId 
      });
    }
  };
  
  const getStatusText = (status: BusinessPlanStatus) => {
    switch (status) {
      case "not_requested": return "Not Requested";
      case "requested": return "Requested";
      case "received": return "Received";
      case "updates_needed": return "Updates Needed";
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      default: return status;
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
        <h3 className="text-lg font-medium">Business Plan</h3>
        {!latestBusinessPlan && (
          <Button onClick={handleRequestBusinessPlan} disabled={requestBusinessPlan.isPending}>
            Request Business Plan
          </Button>
        )}
      </div>
      
      {latestBusinessPlan ? (
        <div className="border rounded-md p-4 bg-card">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className={getStatusColorClass(latestBusinessPlan.status)}>
                  {getStatusText(latestBusinessPlan.status)}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium">Version</p>
                <span>{latestBusinessPlan.version}</span>
              </div>
            </div>
            
            {latestBusinessPlan.requested_at && (
              <div>
                <p className="text-sm font-medium">Requested</p>
                <p className="text-sm">
                  {format(new Date(latestBusinessPlan.requested_at), "PPp")}
                </p>
              </div>
            )}
            
            {latestBusinessPlan.received_at && (
              <div>
                <p className="text-sm font-medium">Received</p>
                <p className="text-sm">
                  {format(new Date(latestBusinessPlan.received_at), "PPp")}
                </p>
              </div>
            )}
            
            {latestBusinessPlan.feedback && (
              <div>
                <p className="text-sm font-medium">Feedback</p>
                <p className="text-sm whitespace-pre-wrap">{latestBusinessPlan.feedback}</p>
              </div>
            )}
            
            {(latestBusinessPlan.status === "requested" || latestBusinessPlan.status === "updates_needed") && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Upload Business Plan</h4>
                <DocumentUploader 
                  relatedEntityId={opportunityId} 
                  relatedEntityType="opportunity"
                  onDocumentUploaded={handleDocumentUploaded}
                />
              </div>
            )}
            
            {latestBusinessPlan.status === "received" && (
              <div className="pt-4 border-t flex flex-wrap gap-2">
                <Button onClick={handleApproveBusinessPlan} className="bg-green-600 hover:bg-green-700">
                  Approve
                </Button>
                <Button onClick={handleRequestUpdates} variant="outline">
                  Request Updates
                </Button>
                <Button onClick={handleReject} variant="destructive">
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex p-8 justify-center items-center rounded-md border bg-muted/40">
          <p className="text-muted-foreground">No business plan has been requested yet.</p>
        </div>
      )}
      
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogTitle>
            {action === "reject" ? "Reject Business Plan" : "Request Updates"}
          </DialogTitle>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback for the investor"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={!feedback.trim()}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
