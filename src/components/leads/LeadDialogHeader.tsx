
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Edit, Loader2, Save, XCircle } from "lucide-react";
import { Lead } from "@/types/crm";
import { LeadToOpportunityButton } from "./LeadToOpportunityButton";

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
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'waiting_for_details': return 'bg-blue-100 text-blue-800';
      case 'waiting_for_approval': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'archived': return 'Archived';
      case 'waiting_for_details': return 'Waiting for Details';
      case 'waiting_for_approval': return 'Waiting for Approval';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const createdDate = new Date(lead.created_at).toLocaleDateString();

  return (
    <DialogHeader className="space-y-3">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl font-bold flex items-center gap-2">
          {lead.name}
          <Badge 
            variant="outline" 
            className={getStatusColor(lead.status)}
          >
            {getStatusLabel(lead.status)}
          </Badge>
        </DialogTitle>
        <div className="flex items-center gap-2">
          {!isEditMode && lead.status !== 'archived' && (
            <LeadToOpportunityButton lead={lead} />
          )}
          
          {isEditMode ? (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground flex items-center">
        <Calendar className="h-4 w-4 mr-1" />
        Created on {createdDate}
      </div>
    </DialogHeader>
  );
}
