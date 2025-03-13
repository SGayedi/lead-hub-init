
import React from "react";
import { formatBytes } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, DownloadIcon, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Document } from "@/types/crm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDelete?: (documentId: string) => void;
}

export function DocumentList({ documents, isLoading, onDelete }: DocumentListProps) {
  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.filePath);
      
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${document.name}`);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-dashed">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4 mt-1" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-20 mr-2" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardHeader>
          <CardTitle className="text-center">No Documents</CardTitle>
          <CardDescription className="text-center">
            No documents have been uploaded yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center">
                  <FileIcon className="h-4 w-4 mr-2" />
                  {doc.name}
                </CardTitle>
                <CardDescription>
                  {formatBytes(doc.fileSize)} • Uploaded {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
              <div className="text-xs bg-muted px-2 py-1 rounded-full">
                {doc.fileType.split('/')[1].toUpperCase()}
              </div>
            </div>
          </CardHeader>
          
          <CardFooter className="pt-2 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => handleDownload(doc)}
            >
              <DownloadIcon className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
            
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(doc.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
