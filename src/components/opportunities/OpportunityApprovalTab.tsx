
import { useState } from "react";
import { useOpportunityApprovals } from "@/hooks/useOpportunityApprovals";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Clock,
  FileCheck,
  AlertTriangle,
  User,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Opportunity } from "@/types/crm";

interface OpportunityApprovalTabProps {
  opportunity: Opportunity;
}

export function OpportunityApprovalTab({ opportunity }: OpportunityApprovalTabProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState("");
  const [isFinalApproval, setIsFinalApproval] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  const { 
    approvals, 
    isLoading, 
    createApproval 
  } = useOpportunityApprovals(opportunity.id);
  
  const dueDiligenceApprovals = approvals.filter(a => a.stage === "due_diligence");
  const finalApprovals = approvals.filter(a => a.is_final);
  
  const handleApprove = async () => {
    await createApproval.mutateAsync({
      opportunityId: opportunity.id,
      stage: selectedStage,
      isFinal,
      comments
    });
    
    setShowDialog(false);
    setComments("");
  };
  
  const isUserSeniorManagement = user?.role === "senior_management";
  const isFinalApproved = finalApprovals.length > 0;
  const isDueDiligenceApproved = opportunity.status === "due_diligence_approved";
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileCheck className="h-5 w-5 mr-2" />
            Approval Status
          </CardTitle>
          <CardDescription>
            Track the approval status of this opportunity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 border rounded-lg">
              <div className={`rounded-full p-2 mr-3 ${isDueDiligenceApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {isDueDiligenceApproved ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-medium">Due Diligence</h3>
                <p className="text-sm text-muted-foreground">
                  {isDueDiligenceApproved 
                    ? "Due diligence has been approved" 
                    : "Due diligence approval pending"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-4 border rounded-lg">
              <div className={`rounded-full p-2 mr-3 ${isFinalApproved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {isFinalApproved ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-medium">Final Approval</h3>
                <p className="text-sm text-muted-foreground">
                  {isFinalApproved 
                    ? "Final approval has been granted" 
                    : "Final approval pending"}
                </p>
              </div>
            </div>
          </div>
          
          {isUserSeniorManagement && !isFinalApproved && isDueDiligenceApproved && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => {
                  setSelectedStage("final");
                  setIsFinalApproval(true);
                  setShowDialog(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Grant Final Approval
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Collapsible open={open} onOpenChange={setOpen} className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
            <h3 className="font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Approval History
            </h3>
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 border-t">
            {isLoading ? (
              <div className="flex justify-center my-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : approvals.length > 0 ? (
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <div key={approval.id} className="bg-muted/30 p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{approval.approver_name || "User"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(approval.approved_at), 'PPp')}
                        </p>
                      </div>
                      <Badge className={approval.is_final ? 'bg-green-100 text-green-800' : ''}>
                        {approval.is_final ? 'Final Approval' : approval.stage.replace('_', ' ')}
                      </Badge>
                    </div>
                    {approval.comments && (
                      <p className="mt-2 text-sm border-t pt-2">{approval.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No approval records found</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isFinalApproval ? "Grant Final Approval" : "Approve Due Diligence"}
            </DialogTitle>
            <DialogDescription>
              {isFinalApproval 
                ? "Granting final approval will mark this opportunity as fully approved." 
                : "Approving due diligence will mark the due diligence process as completed."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Add additional comments (optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={createApproval.isPending}
            >
              {createApproval.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Processing...
                </>
              ) : (
                <>Approve</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
