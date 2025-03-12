
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Trash2, Download, Eye, History, ArrowUpCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Spinner } from './Spinner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

interface DocumentUploaderProps {
  relatedEntityId: string;
  relatedEntityType: "lead" | "meeting" | "opportunity";
  onUpload?: (files: File[]) => Promise<void>;
  onCancel?: () => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  onDocumentUploaded?: (documentId: string) => void;
}

export function DocumentUploader({ 
  relatedEntityId, 
  relatedEntityType,
  onUpload,
  onCancel,
  acceptedFileTypes,
  maxFiles = 1,
  onDocumentUploaded
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [versionDocument, setVersionDocument] = useState<any>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  
  const { 
    documents, 
    isLoading, 
    uploadDocument, 
    deleteDocument, 
    getDocumentUrl,
    previewDocument,
    previewUrl,
    previewDocumentVersion,
    clearPreview
  } = useDocuments({
    relatedEntityId,
    relatedEntityType
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    
    setUploadingFile(true);
    
    try {
      if (onUpload) {
        await onUpload([file]);
      } else {
        const uploadResult = await uploadDocument.mutateAsync({
          file,
          relatedEntityId,
          relatedEntityType,
          existingDocumentId: versionDocument?.id
        });
        
        // Fix: Check if uploadResult exists, is an object, and has an id property before calling onDocumentUploaded
        if (onDocumentUploaded && uploadResult && typeof uploadResult === 'object' && 'id' in uploadResult) {
          onDocumentUploaded(uploadResult.id);
        }
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setVersionDocument(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };
  
  const handleDeleteDocument = async (document: any) => {
    if (window.confirm(`Are you sure you want to delete ${document.name}?`)) {
      await deleteDocument.mutateAsync(document);
    }
  };
  
  const handleViewDocument = async (document: any) => {
    await previewDocumentVersion(document);
  };

  const handleViewVersion = async (document: any, versionPath: string) => {
    setSelectedVersion(versionPath);
    await previewDocumentVersion(document, versionPath);
  };
  
  const handleDownloadDocument = async (document: any, versionPath?: string) => {
    try {
      const path = versionPath || document.filePath;
      const url = await getDocumentUrl(path);
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
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUploadNewVersion = (document: any) => {
    setVersionDocument(document);
    fileInputRef.current?.click();
  };
  
  const handleCancel = () => {
    setVersionDocument(null);
    if (onCancel) {
      onCancel();
    }
  };
  
  const renderFilePreview = () => {
    if (!previewUrl || !previewDocument) return null;
    
    const fileExtension = previewDocument.name.split('.').pop()?.toLowerCase();
    const isImage = fileExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{previewDocument.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(previewDocument.fileSize)} • Version {selectedVersion ? 'History' : previewDocument.version}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDownloadDocument(previewDocument, selectedVersion || undefined)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {!selectedVersion && previewDocument.versionHistory?.length > 0 && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                <History className="mr-2 h-4 w-4" />
                {showVersionHistory ? 'Hide History' : 'View History'}
              </Button>
            )}
          </div>
        </div>

        {showVersionHistory && !selectedVersion && (
          <div className="border rounded-md p-3 space-y-2 mb-4">
            <h4 className="font-medium text-sm">Version History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {previewDocument.versionHistory.map((version: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-secondary rounded-md">
                  <div>
                    <span className="font-medium">Version {version.version}</span>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(version.size)} • {format(new Date(version.uploadedAt), 'PPp')}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewVersion(previewDocument, version.path)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownloadDocument(previewDocument, version.path)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isImage ? (
          <img src={previewUrl} alt={previewDocument.name} className="max-w-full max-h-[60vh] rounded-md mx-auto" />
        ) : isPdf ? (
          <iframe src={previewUrl} className="w-full h-[70vh] rounded-md" />
        ) : (
          <div className="text-center p-10">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p>Preview not available for this file type</p>
            <Button 
              className="mt-4" 
              onClick={() => window.open(previewUrl, '_blank')}
            >
              Open in new tab
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Documents</span>
        </CardTitle>
        <CardDescription>
          Upload and manage documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={acceptedFileTypes?.join(',') || undefined}
            />
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
            >
              {uploadingFile ? (
                <Spinner className="mr-2" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              {versionDocument ? `Upload New Version of ${versionDocument.name}` : 'Upload Document'}
            </Button>
            {(versionDocument || onCancel) && (
              <Button 
                variant="ghost" 
                size="sm"
                className="mt-2"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No documents uploaded yet
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((document) => (
                <div 
                  key={document.id} 
                  className="border rounded-md p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{document.name}</p>
                        {document.version > 1 && (
                          <Badge variant="outline" className="text-xs">v{document.version}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.fileSize)} • {format(new Date(document.updatedAt || document.createdAt), 'PP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewDocument(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <History className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleUploadNewVersion(document)}
                          className="cursor-pointer"
                        >
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                          Upload New Version
                        </DropdownMenuItem>
                        {document.versionHistory && document.versionHistory.length > 0 && (
                          <DropdownMenuItem 
                            onClick={() => handleViewDocument(document)}
                            className="cursor-pointer"
                          >
                            <History className="h-4 w-4 mr-2" />
                            View Version History
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownloadDocument(document)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteDocument(document)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Dialog 
          open={!!previewUrl} 
          onOpenChange={(open) => {
            if (!open) {
              clearPreview();
              setShowVersionHistory(false);
              setSelectedVersion(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            {renderFilePreview()}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
