
import React, { useState } from 'react';
import { Opportunity, OpportunityStatus, NdaStatus, BusinessPlanStatus } from '@/types/crm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Check, Clock, Clipboard, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Spinner } from '@/components/Spinner';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface OpportunityDetailsTabProps {
  opportunity: Opportunity;
}

export function OpportunityDetailsTab({ opportunity }: OpportunityDetailsTabProps) {
  const { user } = useAuth();
  const { updateOpportunityStatus } = useOpportunities();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const handleSubmitForApproval = async () => {
    if (opportunity.status !== 'assessment_completed') {
      toast.error("Opportunity assessment must be completed before submitting for approval");
      return;
    }
    
    setUpdateLoading(true);
    try {
      await updateOpportunityStatus.mutateAsync({
        opportunityId: opportunity.id,
        status: 'waiting_for_approval'
      });
      toast.success("Opportunity submitted for approval");
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast.error("Failed to submit opportunity for approval");
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const handleApprove = async () => {
    setUpdateLoading(true);
    try {
      await updateOpportunityStatus.mutateAsync({
        opportunityId: opportunity.id,
        status: 'due_diligence_approved'
      });
      toast.success("Opportunity approved");
      setShowApproveDialog(false);
    } catch (error) {
      console.error('Error approving opportunity:', error);
      toast.error("Failed to approve opportunity");
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const handleReject = async () => {
    setUpdateLoading(true);
    try {
      await updateOpportunityStatus.mutateAsync({
        opportunityId: opportunity.id,
        status: 'rejected'
      });
      toast.success("Opportunity rejected");
      setShowRejectDialog(false);
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
      toast.error("Failed to reject opportunity");
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const getStatusBadgeVariant = (status: OpportunityStatus) => {
    switch (status) {
      case 'assessment_in_progress':
        return 'outline';
      case 'assessment_completed':
        return 'secondary';
      case 'waiting_for_approval':
        return 'secondary';
      case 'due_diligence_approved':
        return 'outline'; // Using outline instead of 'success'
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getNdaStatusBadgeVariant = (status: NdaStatus) => {
    switch (status) {
      case 'not_issued':
        return 'outline';
      case 'issued':
        return 'outline';
      case 'signed_by_investor':
        return 'secondary';
      case 'counter_signed':
        return 'secondary';
      case 'completed':
        return 'outline'; // Using outline instead of 'success'
      default:
        return 'outline';
    }
  };
  
  const getBusinessPlanStatusBadgeVariant = (status: BusinessPlanStatus) => {
    switch (status) {
      case 'not_requested':
        return 'outline';
      case 'requested':
        return 'outline';
      case 'received':
        return 'secondary';
      case 'updates_needed':
        return 'outline';
      case 'approved':
        return 'outline'; // Using outline instead of 'success'
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getStatusLabel = (status: OpportunityStatus) => {
    switch (status) {
      case 'assessment_in_progress':
        return 'Assessment In Progress';
      case 'assessment_completed':
        return 'Assessment Completed';
      case 'waiting_for_approval':
        return 'Waiting For Approval';
      case 'due_diligence_approved':
        return 'Due Diligence Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };
  
  const getNdaStatusLabel = (status: NdaStatus) => {
    switch (status) {
      case 'not_issued':
        return 'Not Issued';
      case 'issued':
        return 'Issued';
      case 'signed_by_investor':
        return 'Signed By Investor';
      case 'counter_signed':
        return 'Counter Signed';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  const getBusinessPlanStatusLabel = (status: BusinessPlanStatus) => {
    switch (status) {
      case 'not_requested':
        return 'Not Requested';
      case 'requested':
        return 'Requested';
      case 'received':
        return 'Received';
      case 'updates_needed':
        return 'Updates Needed';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clipboard className="h-5 w-5 mr-2" />
            Opportunity Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <Badge variant={getStatusBadgeVariant(opportunity.status)}>
                {getStatusLabel(opportunity.status)}
              </Badge>
              <div className="mt-2 text-sm text-muted-foreground">
                Last updated: {format(new Date(opportunity.updated_at), 'PPp')}
              </div>
            </div>
            <div className="space-x-2">
              {opportunity.status === 'assessment_completed' && (
                <Button 
                  onClick={handleSubmitForApproval} 
                  disabled={updateLoading}
                >
                  {updateLoading ? <Spinner className="mr-2" /> : null}
                  Submit for Approval
                </Button>
              )}
              
              {opportunity.status === 'waiting_for_approval' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={updateLoading}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    disabled={updateLoading}
                  >
                    {updateLoading ? <Spinner className="mr-2" /> : null}
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">NDA Status</Label>
              <div>
                <Badge variant={getNdaStatusBadgeVariant(opportunity.nda_status)}>
                  {getNdaStatusLabel(opportunity.nda_status)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Business Plan Status</Label>
              <div>
                <Badge variant={getBusinessPlanStatusBadgeVariant(opportunity.business_plan_status)}>
                  {getBusinessPlanStatusLabel(opportunity.business_plan_status)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Site Visit</Label>
              <div>
                <Badge variant="outline">
                  {opportunity.site_visit_scheduled ? 'Scheduled' : 'Not Scheduled'}
                </Badge>
                {opportunity.site_visit_date && (
                  <div className="mt-1 text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(opportunity.site_visit_date), 'PPp')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {opportunity.lead && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Lead Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Lead Name</Label>
                <p className="text-sm font-medium">{opportunity.lead.name}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Inquiry Type</Label>
                <p className="text-sm font-medium capitalize">{opportunity.lead.inquiry_type}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Priority</Label>
                <p className="text-sm font-medium capitalize">{opportunity.lead.priority}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Source</Label>
                <p className="text-sm font-medium capitalize">{opportunity.lead.source}</p>
              </div>
              
              {opportunity.lead.email && (
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{opportunity.lead.email}</p>
                </div>
              )}
              
              {opportunity.lead.phone && (
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="text-sm font-medium">{opportunity.lead.phone}</p>
                </div>
              )}
              
              {opportunity.lead.export_quota !== undefined && (
                <div>
                  <Label className="text-muted-foreground">Export Quota</Label>
                  <p className="text-sm font-medium">{opportunity.lead.export_quota}</p>
                </div>
              )}
              
              {opportunity.lead.plot_size !== undefined && (
                <div>
                  <Label className="text-muted-foreground">Plot Size</Label>
                  <p className="text-sm font-medium">{opportunity.lead.plot_size}</p>
                </div>
              )}
            </div>
            
            {opportunity.lead.notes && (
              <div className="mt-4">
                <Label className="text-muted-foreground">Notes</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{opportunity.lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {opportunity.site_visit_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Site Visit Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{opportunity.site_visit_notes}</p>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Due Diligence</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this opportunity? This will mark the due diligence process as completed and approved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={updateLoading}>
              {updateLoading ? <Spinner className="mr-2" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Due Diligence</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this opportunity? This will mark the due diligence process as rejected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={updateLoading}>
              {updateLoading ? <Spinner className="mr-2" /> : null}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
