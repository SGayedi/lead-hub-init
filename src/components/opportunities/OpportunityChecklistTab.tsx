
import { useState } from "react";
import { format } from "date-fns";
import { useDueDiligenceChecklists } from "@/hooks/useDueDiligenceChecklists";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/Spinner";
import { CheckCircle, CircleEllipsis, Circle, Clock } from "lucide-react";
import { getStatusStyle } from "@/lib/utils";
import { ChecklistItemStatus, Opportunity } from "@/types/crm";

interface OpportunityChecklistTabProps {
  opportunity: Opportunity;
}

export function OpportunityChecklistTab({ opportunity }: OpportunityChecklistTabProps) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  
  const { 
    checklist, 
    checklistItems, 
    isLoading, 
    updateChecklistItemStatus,
    updateChecklistItemNotes,
    assignChecklistItem
  } = useDueDiligenceChecklists(opportunity.id);
  
  const handleSaveNotes = async (itemId: string) => {
    if (editingNotes === itemId) {
      await updateChecklistItemNotes.mutateAsync({
        itemId,
        notes,
        status: 'in_progress' as ChecklistItemStatus
      });
      setNotes("");
      setEditingNotes(null);
    }
  };
  
  const renderStatusIcon = (status: ChecklistItemStatus) => {
    switch (status) {
      case "not_started":
        return <Circle className="h-5 w-5 text-gray-400" />;
      case "in_progress":
        return <CircleEllipsis className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status: ChecklistItemStatus) => {
    switch (status) {
      case "not_started":
        return <Badge variant="outline" className="bg-gray-100">Not Started</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Due Diligence Checklist</h3>
      </div>
      
      {checklistItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No checklist items available.
        </div>
      ) : (
        <div className="space-y-4">
          {checklistItems.map((item) => (
            <div key={item.id} className="border rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const newStatus = 
                          item.status === "not_started" ? "in_progress" : 
                          item.status === "in_progress" ? "completed" : 
                          "not_started";
                        
                        updateChecklistItemStatus.mutate({
                          itemId: item.id,
                          status: newStatus as ChecklistItemStatus
                        });
                      }}
                    >
                      {renderStatusIcon(item.status as ChecklistItemStatus)}
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.name}</h4>
                      {getStatusBadge(item.status as ChecklistItemStatus)}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    {item.notes && editingNotes !== item.id && (
                      <div className="mt-2 text-sm border-l-2 border-blue-300 pl-2">
                        {item.notes}
                      </div>
                    )}
                    {item.due_date && (
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Due by {format(new Date(item.due_date), "PPP")}
                      </div>
                    )}
                    {editingNotes === item.id && (
                      <div className="mt-2">
                        <Textarea
                          className="text-sm min-h-[80px]"
                          placeholder="Add notes..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingNotes(null);
                              setNotes("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(item.id)}
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {editingNotes !== item.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingNotes(item.id);
                      setNotes(item.notes || "");
                    }}
                  >
                    Add Notes
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
