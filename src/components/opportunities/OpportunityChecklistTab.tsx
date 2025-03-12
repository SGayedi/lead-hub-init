
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckSquare, 
  Square, 
  Clock, 
  CheckCircle,
  XCircle,
  Calendar,
  User
} from "lucide-react";
import { useDueDiligenceChecklists } from "@/hooks/useDueDiligenceChecklists";
import { Spinner } from "@/components/Spinner";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChecklistItemStatus } from "@/types/crm";

interface OpportunityChecklistTabProps {
  opportunityId: string;
}

export function OpportunityChecklistTab({ opportunityId }: OpportunityChecklistTabProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [itemNotes, setItemNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  const { 
    checklist,
    checklistItems,
    isLoading,
    updateChecklistItemStatus,
    assignChecklistItem
  } = useDueDiligenceChecklists(opportunityId);

  const handleStatusChange = async (itemId: string, status: ChecklistItemStatus) => {
    await updateChecklistItemStatus.mutateAsync({ itemId, status });
  };

  const handleSaveNotes = async () => {
    if (activeItem) {
      await updateChecklistItemStatus.mutateAsync({ 
        itemId: activeItem, 
        notes: itemNotes 
      });
      setShowNotesDialog(false);
      setActiveItem(null);
      setItemNotes("");
    }
  };

  const handleAssign = async () => {
    if (activeItem) {
      await assignChecklistItem.mutateAsync({ 
        itemId: activeItem, 
        assignedTo, 
        dueDate: dueDate || undefined 
      });
      setShowAssignDialog(false);
      setActiveItem(null);
      setAssignedTo("");
      setDueDate("");
    }
  };

  const openNotesDialog = (itemId: string, notes?: string) => {
    setActiveItem(itemId);
    setItemNotes(notes || "");
    setShowNotesDialog(true);
  };

  const openAssignDialog = (itemId: string, currentAssignedTo?: string, currentDueDate?: string) => {
    setActiveItem(itemId);
    setAssignedTo(currentAssignedTo || "");
    setDueDate(currentDueDate ? new Date(currentDueDate).toISOString().split('T')[0] : "");
    setShowAssignDialog(true);
  };

  const getStatusIcon = (status: ChecklistItemStatus) => {
    switch (status) {
      case "completed":
        return <CheckSquare className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "not_started":
      default:
        return <Square className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ChecklistItemStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
      case "not_started":
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!checklist) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No checklist found</h3>
        <p className="text-muted-foreground">
          There is no due diligence checklist associated with this opportunity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{checklist.name}</CardTitle>
          <CardDescription>
            Track and manage the due diligence process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklistItems.length === 0 ? (
              <div className="p-4 text-center">
                <p>No checklist items found.</p>
              </div>
            ) : (
              checklistItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => {
                          const nextStatus = item.status === "not_started" 
                            ? "in_progress" 
                            : item.status === "in_progress" 
                              ? "completed" 
                              : "not_started";
                          handleStatusChange(item.id, nextStatus);
                        }}
                        className="mt-1"
                      >
                        {getStatusIcon(item.status)}
                      </button>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div>
                            <h4 className="font-medium text-base">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 md:mt-0">
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                        
                        {(item.assigned_to || item.due_date) && (
                          <div className="mt-3 flex flex-wrap gap-3">
                            {item.assigned_to && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <User className="h-3.5 w-3.5 mr-1" />
                                Assigned to: {item.assigned_to}
                              </div>
                            )}
                            {item.due_date && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                Due: {new Date(item.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {item.notes && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-md">
                            <p className="text-sm">{item.notes}</p>
                          </div>
                        )}
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openNotesDialog(item.id, item.notes)}
                          >
                            Add Notes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openAssignDialog(item.id, item.assigned_to, item.due_date)}
                          >
                            Assign
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(item.id, "not_started")}
                            disabled={item.status === "not_started"}
                          >
                            Mark Not Started
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(item.id, "in_progress")}
                            disabled={item.status === "in_progress"}
                          >
                            Mark In Progress
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusChange(item.id, "completed")}
                            disabled={item.status === "completed"}
                          >
                            Mark Completed
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter notes for this checklist item..."
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Checklist Item</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="assigned-to">Assign To</Label>
              <Input
                id="assigned-to"
                placeholder="Enter user id or name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>Save Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
