
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X } from "lucide-react";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OpportunityDialogHeaderProps {
  opportunity: Opportunity;
  onUpdated?: () => void;
}

export function OpportunityDialogHeader({ opportunity, onUpdated }: OpportunityDialogHeaderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState<OpportunityStatus>(opportunity.status);
  const queryClient = useQueryClient();

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assessment_in_progress': return 'bg-blue-100 text-blue-800';
      case 'assessment_completed': return 'bg-yellow-100 text-yellow-800';
      case 'waiting_for_approval': return 'bg-purple-100 text-purple-800';
      case 'due_diligence_approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateStatusMutation = useMutation({
    mutationFn: async (status: OpportunityStatus) => {
      const { error } = await supabase
        .from('opportunities')
        .update({ status })
        .eq('id', opportunity.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Opportunity status updated successfully');
      if (onUpdated) {
        onUpdated();
      }
      setIsEditMode(false);
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  const handleSave = () => {
    updateStatusMutation.mutate(updatedStatus);
  };

  const handleCancel = () => {
    setUpdatedStatus(opportunity.status);
    setIsEditMode(false);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">
            {opportunity.lead?.name || 'Opportunity Details'}
          </h2>
          {!isEditMode ? (
            <Badge variant="outline" className={getStatusColor(opportunity.status)}>
              {formatStatus(opportunity.status)}
            </Badge>
          ) : (
            <select
              className="border p-1 rounded text-sm"
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value as OpportunityStatus)}
            >
              <option value="assessment_in_progress">Assessment In Progress</option>
              <option value="assessment_completed">Assessment Completed</option>
              <option value="waiting_for_approval">Waiting For Approval</option>
              <option value="due_diligence_approved">Due Diligence Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>
        <p className="text-muted-foreground mt-1">
          From lead: <span className="font-medium">{opportunity.lead?.name}</span>
        </p>
      </div>

      <div className="mt-4 md:mt-0 flex gap-2">
        {!isEditMode ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditMode(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Status
          </Button>
        ) : (
          <>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              disabled={updateStatusMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              disabled={updateStatusMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
