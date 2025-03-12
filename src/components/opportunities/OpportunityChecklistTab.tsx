
import React, { useState } from 'react';
import { Opportunity, ChecklistItemStatus, DueDiligenceChecklistItem } from '@/types/crm';
import { useDueDiligenceChecklists } from '@/hooks/useDueDiligenceChecklists';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/Spinner';
import { getStatusStyle } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle2, CircleDashed, CircleDot, ClipboardList, Clock, User } from 'lucide-react';

interface OpportunityChecklistTabProps {
  opportunity: Opportunity;
}

export function OpportunityChecklistTab({ opportunity }: OpportunityChecklistTabProps) {
  const { 
    checklists, 
    checklistItems, 
    isLoading,
    updateChecklistItemStatus,
    updateChecklistItemNotes
  } = useDueDiligenceChecklists(opportunity.id);
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  
  const handleStatusChange = async (itemId: string, status: ChecklistItemStatus) => {
    await updateChecklistItemStatus.mutateAsync({ itemId, status });
  };
  
  const handleSaveNotes = async () => {
    if (!selectedItemId) return;
    
    await updateChecklistItemNotes.mutateAsync({ 
      itemId: selectedItemId,
      status: checklistItems.find(item => item.id === selectedItemId)?.status || 'not_started',
      notes
    });
    
    setEditingNotes(false);
  };
  
  const getStatusIcon = (status: ChecklistItemStatus) => {
    switch (status) {
      case 'not_started':
        return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
      case 'in_progress':
        return <CircleDot className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }
  
  if (!checklists.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No checklists found for this opportunity.</p>
      </div>
    );
  }
  
  const checklist = checklists[0]; // Use the first checklist
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{checklist.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {checklistItems.map((item) => (
              <div 
                key={item.id}
                className={`p-4 hover:bg-muted transition-colors ${selectedItemId === item.id ? 'bg-muted' : ''}`}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setNotes(item.notes || '');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={item.status === 'not_started' ? 'outline' : 'ghost'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item.id, 'not_started');
                      }}
                    >
                      Not Started
                    </Button>
                    <Button
                      variant={item.status === 'in_progress' ? 'outline' : 'ghost'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item.id, 'in_progress');
                      }}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant={item.status === 'completed' ? 'outline' : 'ghost'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item.id, 'completed');
                      }}
                    >
                      Completed
                    </Button>
                  </div>
                </div>
                
                {selectedItemId === item.id && (
                  <div className="mt-4 pt-4 border-t">
                    {item.assigned_to && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <User className="h-3 w-3 mr-1" />
                        <span>Assigned to: {item.assigned_to}</span>
                      </div>
                    )}
                    
                    {item.due_date && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Due: {format(new Date(item.due_date), 'PPp')}</span>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Notes</h4>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingNotes(!editingNotes)}
                        >
                          {editingNotes ? 'Cancel' : 'Edit'}
                        </Button>
                      </div>
                      
                      {editingNotes ? (
                        <div className="space-y-2">
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                          />
                          <div className="flex justify-end">
                            <Button 
                              size="sm"
                              onClick={handleSaveNotes}
                              disabled={updateChecklistItemNotes.isPending}
                            >
                              {updateChecklistItemNotes.isPending && <Spinner className="mr-2" />}
                              Save Notes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">
                          {item.notes || 'No notes provided.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
