
import React, { useState } from 'react';
import { Opportunity, BusinessPlan, BusinessPlanStatus } from '@/types/crm';
import { useBusinessPlans } from '@/hooks/useBusinessPlans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { Spinner } from '@/components/Spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentUploader } from '@/components/DocumentUploader';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, CheckCircle, AlertTriangle, Clock, Download, Eye, History, MessageSquare } from 'lucide-react';

interface OpportunityBusinessPlanTabProps {
  opportunity: Opportunity;
}

export function OpportunityBusinessPlanTab({ opportunity }: OpportunityBusinessPlanTabProps) {
  const { 
    businessPlans, 
    isLoading, 
    uploadBusinessPlanDocument, 
    requestBusinessPlan,
    updateBusinessPlanStatus
  } = useBusinessPlans(opportunity.id);
  
  const { getDocumentUrl } = useDocuments({
    relatedEntityId: opportunity.id,
    relatedEntityType: 'opportunity'
  });
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BusinessPlan | null>(null);
  const [updating, setUpdating] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  
  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    
    try {
      await uploadBusinessPlanDocument.mutateAsync({
        file: files[0],
        opportunity_id: opportunity.id
      });
      
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error uploading business plan:', error);
    }
  };
  
  const handleStatusChange = async (plan: BusinessPlan, status: BusinessPlanStatus) => {
    setUpdating(true);
    try {
      await updateBusinessPlanStatus.mutateAsync({
        businessPlanId: plan.id,
        status,
        feedback: feedback || undefined
      });
      toast.success(`Business plan status updated to ${status}`);
      setShowFeedbackDialog(false);
    } catch (error) {
      console.error('Error updating business plan status:', error);
      toast.error('Failed to update business plan status');
    } finally {
      setUpdating(false);
      setFeedback('');
    }
  };
  
  const handleRequestBusinessPlan = async () => {
    try {
      await requestBusinessPlan.mutateAsync({
        opportunity_id: opportunity.id,
        notes: requestNotes
      });
      toast.success('Business plan requested');
      setShowRequestDialog(false);
      setRequestNotes('');
    } catch (error) {
      console.error('Error requesting business plan:', error);
      toast.error('Failed to request business plan');
    }
  };
  
  const handleViewDocument = async (plan: BusinessPlan) => {
    if (!plan.document_id) {
      toast.error('No document attached to this business plan');
      return;
    }
    
    try {
      // We need to fix this to ensure the document object has a name property
      const document = {
        id: plan.document_id,
        name: `BusinessPlan_v${plan.version}.pdf`, // Adding the missing name property
        filePath: '', // This will be filled by the backend
        fileType: 'application/pdf',
        fileSize: 0,
        uploadedBy: plan.requested_by || '',
        relatedEntityId: opportunity.id,
        relatedEntityType: 'opportunity' as const,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
        version: plan.version
      };
      
      const url = await getDocumentUrl(document.filePath);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to open document');
    }
  };
  
  const handleDownloadDocument = async (plan: BusinessPlan) => {
    if (!plan.document_id) {
      toast.error('No document attached to this business plan');
      return;
    }
    
    try {
      // We need to fix this to ensure the document object has a name property
      const document = {
        id: plan.document_id,
        name: `BusinessPlan_v${plan.version}.pdf`, // Adding the missing name property
        filePath: '', // This will be filled by the backend
        fileType: 'application/pdf',
        fileSize: 0,
        uploadedBy: plan.requested_by || '',
        relatedEntityId: opportunity.id,
        relatedEntityType: 'opportunity' as const,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
        version: plan.version
      };
      
      const url = await getDocumentUrl(document.filePath);
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
      toast.error('Failed to download document');
    }
  };
  
  const getStatusLabel = (status: BusinessPlanStatus) => {
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
  
  const getStatusIcon = (status: BusinessPlanStatus) => {
    switch (status) {
      case 'not_requested':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'requested':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'received':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'updates_needed':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }
  
  const latestPlan = businessPlans.length > 0 ? businessPlans[0] : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Business Plan Management</h2>
        <div className="space-x-2">
          {opportunity.business_plan_status === 'not_requested' && (
            <Button onClick={() => setShowRequestDialog(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Business Plan
            </Button>
          )}
          {(opportunity.business_plan_status === 'requested' || opportunity.business_plan_status === 'updates_needed') && (
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Business Plan
            </Button>
          )}
        </div>
      </div>
      
      {latestPlan ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <span>Business Plan v{latestPlan.version}</span>
              </div>
              <Badge>{getStatusLabel(latestPlan.status)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestPlan.requested_by && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                    <p>{latestPlan.requested_by}</p>
                  </div>
                )}
                
                {latestPlan.requested_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requested At</p>
                    <p>{format(new Date(latestPlan.requested_at), 'PPp')}</p>
                  </div>
                )}
                
                {latestPlan.received_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Received At</p>
                    <p>{format(new Date(latestPlan.received_at), 'PPp')}</p>
                  </div>
                )}
                
                {latestPlan.approved_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved At</p>
                    <p>{format(new Date(latestPlan.approved_at), 'PPp')}</p>
                  </div>
                )}
                
                {latestPlan.approved_by && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                    <p>{latestPlan.approved_by}</p>
                  </div>
                )}
              </div>
              
              {latestPlan.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap">{latestPlan.notes}</p>
                </div>
              )}
              
              {latestPlan.feedback && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                  <p className="whitespace-pre-wrap">{latestPlan.feedback}</p>
                </div>
              )}
              
              <div className="flex space-x-2">
                {latestPlan.document_id && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocument(latestPlan)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadDocument(latestPlan)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
                
                {businessPlans.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedPlan(latestPlan)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                )}
              </div>
              
              {latestPlan.status === 'received' && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Review Business Plan</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPlan(latestPlan);
                        setShowFeedbackDialog(true);
                        setFeedback('');
                      }}
                    >
                      Request Updates
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        setSelectedPlan(latestPlan);
                        setShowFeedbackDialog(true);
                        setFeedback('');
                      }}
                    >
                      Reject
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleStatusChange(latestPlan, 'approved')}
                      disabled={updating}
                    >
                      {updating ? <Spinner className="mr-2" /> : null}
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : opportunity.business_plan_status === 'requested' ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Business Plan Requested</h3>
            <p className="text-muted-foreground mb-4">
              Waiting for the investor to submit their business plan.
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Business Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Business Plan Requested Yet</h3>
            <p className="text-muted-foreground mb-4">
              Request a business plan from the investor to begin the review process.
            </p>
            <Button onClick={() => setShowRequestDialog(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Business Plan
            </Button>
          </CardContent>
        </Card>
      )}
      
      {businessPlans.length > 0 && businessPlans.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Plan History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {businessPlans.slice(1).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                  <div className="flex items-center">
                    <div className="mr-4">{getStatusIcon(plan.status)}</div>
                    <div>
                      <p className="font-medium">Business Plan v{plan.version}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(plan.created_at), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {plan.document_id && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDocument(plan)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadDocument(plan)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Business Plan</DialogTitle>
          </DialogHeader>
          <DocumentUploader 
            relatedEntityId={opportunity.id}
            relatedEntityType="opportunity"
            onUpload={handleUpload}
            onCancel={() => setShowUploadDialog(false)}
            acceptedFileTypes={['.pdf', '.docx', '.doc', '.pptx', '.xlsx']}
            maxFiles={1}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Business Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                Enter any specific requirements or guidelines for the business plan.
              </p>
              <Textarea
                placeholder="Please provide a comprehensive business plan including financial projections, market analysis, and implementation timeline..."
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowRequestDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRequestBusinessPlan}
                disabled={requestBusinessPlan.isPending}
              >
                {requestBusinessPlan.isPending && <Spinner className="mr-2" />}
                Request Business Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm">
                Enter feedback for the business plan.
              </p>
              <Textarea
                placeholder="The business plan needs more detailed financial projections and a clearer implementation timeline..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedPlan && handleStatusChange(selectedPlan, 'rejected')}
                disabled={updating || !feedback.trim()}
              >
                {updating && <Spinner className="mr-2" />}
                Reject
              </Button>
              <Button 
                onClick={() => selectedPlan && handleStatusChange(selectedPlan, 'updates_needed')}
                disabled={updating || !feedback.trim()}
              >
                {updating && <Spinner className="mr-2" />}
                Request Updates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
