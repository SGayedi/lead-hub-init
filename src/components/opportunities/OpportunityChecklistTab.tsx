
import { useState } from "react";
import { useDueDiligenceChecklists } from "@/hooks/useDueDiligenceChecklists";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { getStatusStyle } from "@/lib/utils";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface OpportunityChecklistTabProps {
  opportunityId: string;
}

export function OpportunityChecklistTab({ opportunityId }: OpportunityChecklistTabProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [noteDialog, setNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState("");
  
  const {
    checklist,
    checklistItems,
    isLoading,
    updateChecklistItemStatus,
    updateChecklistItemNotes,
    assignChecklistItem
  } = useDueDiligenceChecklists(opportunityId);
  
  const handleStatusChange = (itemId: string, status: string) => {
    updateChecklistItemStatus.mutate({ 
      itemId, 
      status: status as any 
    });
  };
  
  const handleOpenNoteDialog = (itemId: string, currentNote: string = "") => {
    setSelectedItemId(itemId);
    setNewNote(currentNote);
    setNoteDialog(true);
  };
  
  const handleSaveNote = () => {
    if (selectedItemId) {
      updateChecklistItemNotes.mutate({ 
        itemId: selectedItemId, 
        notes: newNote 
      });
    }
    setNoteDialog(false);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }
  
  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-center text-muted-foreground">
          No due diligence checklist has been created for this opportunity yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">{checklist.name}</h3>
      </div>
      
      <div className="space-y-4">
        {checklistItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No checklist items found
          </p>
        ) : (
          checklistItems.map((item) => (
            <div key={item.id} className="border rounded-md p-3 bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div 
                    className="mt-1 cursor-pointer"
                    onClick={() => {
                      const nextStatus = 
                        item.status === "not_started" ? "in_progress" :
                        item.status === "in_progress" ? "completed" : "not_started";
                      
                      handleStatusChange(item.id, nextStatus);
                    }}
                  >
                    {getStatusIcon(item.status)}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                    
                    {item.notes && (
                      <div className="mt-2 p-2 bg-muted rounded-sm text-sm">
                        <p className="font-medium">Notes:</p>
                        <p className="whitespace-pre-wrap">{item.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenNoteDialog(item.id, item.notes || "")}
                      >
                        {item.notes ? "Edit Notes" : "Add Notes"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Select 
                    value={item.status}
                    onValueChange={(value) => handleStatusChange(item.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter notes about this task..."
              rows={6}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNoteDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
