
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Trash2, Download, Eye } from 'lucide-react';
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { Spinner } from './Spinner';

interface DocumentUploaderProps {
  relatedEntityId: string;
  relatedEntityType: "lead" | "meeting";
}

export function DocumentUploader({ 
  relatedEntityId, 
  relatedEntityType 
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const { 
    documents, 
    isLoading, 
    uploadDocument, 
    deleteDocument, 
    getDocumentUrl 
  } = useDocuments({
    relatedEntityId,
    relatedEntityType
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    
    setUploadingFile(true);
    
    try {
      await uploadDocument.mutateAsync({
        file,
        relatedEntityId,
        relatedEntityType
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    try {
      const url = await getDocumentUrl(document.filePath);
      if (url) {
        setPreviewUrl(url);
        setPreviewName(document.name);
      }
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to generate preview URL');
    }
  };
  
  const handleDownloadDocument = async (document: any) => {
    try {
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
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return 'image';
    } else if (fileType.includes('pdf')) {
      return 'pdf';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'doc';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return 'excel';
    } else {
      return 'file';
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const renderFilePreview = () => {
    if (!previewUrl || !previewName) return null;
    
    const fileExtension = previewName.split('.').pop()?.toLowerCase();
    const isImage = fileExtension && ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    
    if (isImage) {
      return <img src={previewUrl} alt={previewName} className="max-w-full max-h-[70vh]" />;
    } else if (isPdf) {
      return <iframe src={previewUrl} className="w-full h-[70vh]" />;
    } else {
      return (
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
      );
    }
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
              Upload Document
            </Button>
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
                      <p className="font-medium text-sm">{document.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.fileSize)}
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
          onOpenChange={(open) => !open && setPreviewUrl(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewName}</DialogTitle>
            </DialogHeader>
            {renderFilePreview()}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
