
import React, { useState } from 'react';
import { Opportunity, Nda, NdaStatus } from '@/types/crm';
import { useNdas } from '@/hooks/useNdas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { Spinner } from '@/components/Spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentUploader } from '@/components/DocumentUploader';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Upload, CheckCircle, AlertTriangle, Clock, Download, Eye, History } from 'lucide-react';

interface OpportunityNdaTabProps {
  opportunity: Opportunity;
}

export function OpportunityNdaTab({ opportunity }: OpportunityNdaTabProps) {
  const { 
    ndas, 
    isLoading, 
    uploadNdaDocument, 
    updateNdaStatus 
  } = useNdas(opportunity.id);
  
  const { getDocumentUrl } = useDocuments({
    relatedEntityId: opportunity.id,
    relatedEntityType: 'opportunity'
  });
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedNda, setSelectedNda] = useState<Nda | null>(null);
  const [updating, setUpdating] = useState(false);
  
  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    
    try {
      await uploadNdaDocument.mutateAsync({
        file: files[0],
        opportunity_id: opportunity.id
      });
      
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Error uploading NDA:', error);
    }
  };
  
  const handleStatusChange = async (nda: Nda, status: NdaStatus) => {
    setUpdating(true);
    try {
      await updateNdaStatus.mutateAsync({
        ndaId: nda.id,
        status
      });
      toast.success(`NDA status updated to ${status}`);
    } catch (error) {
      console.error('Error updating NDA status:', error);
      toast.error('Failed to update NDA status');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleViewDocument = async (nda: Nda) => {
    if (!nda.document_id) {
      toast.error('No document attached to this NDA');
      return;
    }
    
    try {
      // We need to fix this to ensure the document object has a name property
      const document = {
        id: nda.document_id,
        name: `NDA_v${nda.version}.pdf`, // Adding the missing name property
        filePath: '', // This will be filled by the backend
        fileType: 'application/pdf',
        fileSize: 0,
        uploadedBy: nda.issued_by || '',
        relatedEntityId: opportunity.id,
        relatedEntityType: 'opportunity' as const,
        createdAt: nda.created_at,
        updatedAt: nda.updated_at,
        version: nda.version
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
  
  const handleDownloadDocument = async (nda: Nda) => {
    if (!nda.document_id) {
      toast.error('No document attached to this NDA');
      return;
    }
    
    try {
      // We need to fix this to ensure the document object has a name property
      const document = {
        id: nda.document_id,
        name: `NDA_v${nda.version}.pdf`, // Adding the missing name property
        filePath: '', // This will be filled by the backend
        fileType: 'application/pdf',
        fileSize: 0,
        uploadedBy: nda.issued_by || '',
        relatedEntityId: opportunity.id,
        relatedEntityType: 'opportunity' as const,
        createdAt: nda.created_at,
        updatedAt: nda.updated_at,
        version: nda.version
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
  
  const getStatusLabel = (status: NdaStatus) => {
    switch (status) {
      case 'not_issued':
        return 'Not Issued';
      case 'issued':
        return 'Issued';
      case 'signed_by_investor':
        return 'Signed by Investor';
      case 'counter_signed':
        return 'Counter-signed';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  const getStatusIcon = (status: NdaStatus) => {
    switch (status) {
      case 'not_issued':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'issued':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'signed_by_investor':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'counter_signed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
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
  
  const latestNda = ndas.length > 0 ? ndas[0] : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">NDA Management</h2>
        {(!latestNda || latestNda.status === 'completed') && (
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload NDA
          </Button>
        )}
      </div>
      
      {latestNda ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <span>NDA v{latestNda.version}</span>
              </div>
              <Badge>{getStatusLabel(latestNda.status)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issued By</p>
                  <p>{latestNda.issued_by || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issued At</p>
                  <p>{format(new Date(latestNda.issued_at), 'PPp')}</p>
                </div>
                
                {latestNda.signed_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Signed At</p>
                    <p>{format(new Date(latestNda.signed_at), 'PPp')}</p>
                  </div>
                )}
                
                {latestNda.countersigned_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Counter-signed At</p>
                    <p>{format(new Date(latestNda.countersigned_at), 'PPp')}</p>
                  </div>
                )}
                
                {latestNda.completed_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                    <p>{format(new Date(latestNda.completed_at), 'PPp')}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {latestNda.document_id && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocument(latestNda)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadDocument(latestNda)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
                
                {ndas.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedNda(latestNda)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {latestNda.status !== 'signed_by_investor' && (
                    <Button 
                      size="sm" 
                      variant={latestNda.status === 'issued' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(latestNda, 'signed_by_investor')}
                      disabled={updating}
                    >
                      {updating ? <Spinner className="mr-2" /> : null}
                      Mark as Signed by Investor
                    </Button>
                  )}
                  
                  {latestNda.status !== 'counter_signed' && latestNda.status === 'signed_by_investor' && (
                    <Button 
                      size="sm" 
                      variant={latestNda.status === 'signed_by_investor' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(latestNda, 'counter_signed')}
                      disabled={updating}
                    >
                      {updating ? <Spinner className="mr-2" /> : null}
                      Mark as Counter-signed
                    </Button>
                  )}
                  
                  {latestNda.status !== 'completed' && latestNda.status === 'counter_signed' && (
                    <Button 
                      size="sm" 
                      variant={latestNda.status === 'counter_signed' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange(latestNda, 'completed')}
                      disabled={updating}
                    >
                      {updating ? <Spinner className="mr-2" /> : null}
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No NDA Issued Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload an NDA to begin the NDA management process.
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload NDA
            </Button>
          </CardContent>
        </Card>
      )}
      
      {ndas.length > 0 && ndas.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>NDA History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ndas.slice(1).map((nda) => (
                <div key={nda.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                  <div className="flex items-center">
                    <div className="mr-4">{getStatusIcon(nda.status)}</div>
                    <div>
                      <p className="font-medium">NDA v{nda.version}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(nda.created_at), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {nda.document_id && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDocument(nda)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadDocument(nda)}
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
            <DialogTitle>Upload NDA</DialogTitle>
          </DialogHeader>
          <DocumentUploader 
            relatedEntityId={opportunity.id}
            relatedEntityType="opportunity"
            onUpload={handleUpload}
            onCancel={() => setShowUploadDialog(false)}
            acceptedFileTypes={['.pdf', '.docx', '.doc']}
            maxFiles={1}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
