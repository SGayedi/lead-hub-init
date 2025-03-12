
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead, LeadStatus, Priority, LeadSource, InquiryType } from "@/types/crm";
import { TaskCreationForm } from "./TaskCreationForm";
import { DocumentUploader } from "./DocumentUploader";
import { useDocuments } from "@/hooks/useDocuments";
import { CommentSection } from "./CommentSection";
import { Spinner } from "./Spinner";
import { RelatedTasks } from "./RelatedTasks";
import { format } from "date-fns";
import { PlusCircle, FileText, MessageSquare, CalendarClock, Pencil, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadDetailsDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated?: () => void;
}

export function LeadDetailsDialog({ lead, isOpen, onClose, onLeadUpdated }: LeadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  
  const { documents, isLoading: isLoadingDocuments } = useDocuments(
    lead ? { relatedEntityId: lead.id, relatedEntityType: "lead" } : undefined
  );

  useEffect(() => {
    if (lead) {
      setEditedLead(lead);
    }
  }, [lead]);

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

  const handleSave = async () => {
    if (!lead) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          name: editedLead.name,
          email: editedLead.email,
          phone: editedLead.phone,
          status: editedLead.status,
          priority: editedLead.priority,
          inquiry_type: editedLead.inquiry_type,
          source: editedLead.source,
          export_quota: editedLead.export_quota,
          plot_size: editedLead.plot_size,
          notes: editedLead.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", lead.id);

      if (error) throw error;
      
      toast.success("Lead updated successfully");
      setIsEditMode(false);
      
      // Call the callback to refresh leads if provided
      if (onLeadUpdated) {
        onLeadUpdated();
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">{lead.name}</DialogTitle>
            {!isEditMode ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditedLead(lead);
                  }}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
          {!isEditMode && (
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
          )}
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
            {isEditMode ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={editedLead.name || ""}
                      onChange={(e) => setEditedLead({...editedLead, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={editedLead.email || ""}
                      onChange={(e) => setEditedLead({...editedLead, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={editedLead.phone || ""}
                      onChange={(e) => setEditedLead({...editedLead, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type">Inquiry Type</Label>
                    <Select 
                      value={editedLead.inquiry_type || "individual"}
                      onValueChange={(value) => setEditedLead({...editedLead, inquiry_type: value as InquiryType})}
                    >
                      <SelectTrigger id="inquiry-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Select 
                      value={editedLead.source || "website"}
                      onValueChange={(value) => setEditedLead({...editedLead, source: value as LeadSource})}
                    >
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="outlook">Outlook</SelectItem>
                        <SelectItem value="gmail">Gmail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={editedLead.status || "active"}
                      onValueChange={(value) => setEditedLead({...editedLead, status: value as LeadStatus})}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="waiting_for_details">Waiting for Details</SelectItem>
                        <SelectItem value="waiting_for_approval">Waiting for Approval</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={editedLead.priority || "medium"}
                      onValueChange={(value) => setEditedLead({...editedLead, priority: value as Priority})}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="export-quota">Export Quota</Label>
                    <Input 
                      id="export-quota" 
                      type="number"
                      value={editedLead.export_quota?.toString() || ""}
                      onChange={(e) => setEditedLead({...editedLead, export_quota: e.target.value ? parseInt(e.target.value, 10) : undefined})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plot-size">Plot Size</Label>
                    <Input 
                      id="plot-size" 
                      type="number"
                      value={editedLead.plot_size?.toString() || ""}
                      onChange={(e) => setEditedLead({...editedLead, plot_size: e.target.value ? parseFloat(e.target.value) : undefined})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    rows={5}
                    value={editedLead.notes || ""}
                    onChange={(e) => setEditedLead({...editedLead, notes: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <>
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
              </>
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
