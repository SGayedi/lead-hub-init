
import { Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lead } from "@/types/crm";

interface LeadDialogHeaderProps {
  lead: Lead;
  isEditMode: boolean;
  isSaving: boolean;
  setIsEditMode: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function LeadDialogHeader({
  lead,
  isEditMode,
  isSaving,
  setIsEditMode,
  onSave,
  onCancel
}: LeadDialogHeaderProps) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
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
              onClick={onCancel}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={onSave}
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
  );
}
