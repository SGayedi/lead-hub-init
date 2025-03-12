import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/crm";
import { TaskCreationForm } from "./TaskCreationForm";
import { DocumentUploader } from "./DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { CommentSection } from "./CommentSection";
import { Spinner } from "./Spinner";
import { RelatedTasks } from "./RelatedTasks";
import { format } from "date-fns";
import { PlusCircle, FileText, MessageSquare, CalendarClock } from "lucide-react";

interface LeadDetailsDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailsDialog({ lead, isOpen, onClose }: LeadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { documents, isLoading: isLoadingDocuments } = useDocuments(
    lead ? { relatedEntityId: lead.id, relatedEntityType: "lead" } : undefined
  );

  if (!lead) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-800";
      case "archived": return "bg-gray-100 text-gray-800";
      case "waiting_for_details": return "bg-blue-100 text-blue-800";
      case "waiting_for_approval": return "bg-purple-100 text-purple-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "archived": return "Archived";
      case "waiting_for_details": return "Waiting for Details";
      case "waiting_for_approval": return "Waiting for Approval";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{lead.name}</DialogTitle>
          <DialogDescription className="flex gap-2 mt-2">
            <Badge variant="outline" className={getStatusColor(lead.status)}>
              {getStatusLabel(lead.status)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(lead.priority)}>
              {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
            </Badge>
            <Badge variant="outline">
              {lead.inquiry_type === "company" ? "Company" : "Individual"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Documents
              {documents && documents.length > 0 && (
                <Badge variant="secondary" className="ml-1">{documents.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <CalendarClock className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Created</h3>
                <p>{formatDate(lead.created_at)}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Updated</h3>
                <p>{formatDate(lead.updated_at)}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Source</h3>
                <p>{lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                <p>{lead.email || "-"}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Phone</h3>
                <p>{lead.phone || "-"}</p>
              </div>
              {lead.export_quota && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Export Quota</h3>
                  <p>{lead.export_quota}</p>
                </div>
              )}
              {lead.plot_size && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">Plot Size</h3>
                  <p>{lead.plot_size}</p>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="space-y-2 mt-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Notes</h3>
                <p className="whitespace-pre-line">{lead.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documents</h3>
            </div>

            <DocumentUploader 
              relatedEntityId={lead.id} 
              relatedEntityType="lead"
            />

            {isLoadingDocuments ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(doc.fileSize / 1024).toFixed(2)} KB • Uploaded on {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No documents attached to this lead yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tasks</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowTaskForm(true)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                New Task
              </Button>
            </div>

            {showTaskForm && (
              <div className="border p-4 rounded-md bg-muted/50 mb-4">
                <h4 className="font-medium mb-2">Create Task for {lead.name}</h4>
                <TaskCreationForm 
                  onSuccess={() => setShowTaskForm(false)}
                  relatedEntityId={lead.id}
                  relatedEntityType="lead"
                />
              </div>
            )}

            <RelatedTasks entityId={lead.id} entityType="lead" />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <CommentSection 
              relatedEntityId={lead.id} 
              relatedEntityType="lead"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
