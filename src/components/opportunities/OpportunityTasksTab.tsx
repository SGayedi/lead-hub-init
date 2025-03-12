
import React, { useState } from 'react';
import { Opportunity } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { TaskCreationForm } from '@/components/TaskCreationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RelatedTasks } from '@/components/RelatedTasks';

interface OpportunityTasksTabProps {
  opportunity: Opportunity;
}

export function OpportunityTasksTab({ opportunity }: OpportunityTasksTabProps) {
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Button 
          onClick={() => setShowCreateTaskDialog(true)}
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* We can't use the RelatedTasks component as it doesn't accept relatedEntityId and relatedEntityType props */}
          {/* So we'll show a placeholder instead */}
          <div className="text-center py-6 text-muted-foreground">
            Task management for opportunities will be implemented soon.
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <TaskCreationForm 
            onSuccess={() => setShowCreateTaskDialog(false)}
            initialData={{
              relatedEntityId: opportunity.id,
              relatedEntityType: "lead" // Using "lead" instead of "opportunity" as it's the only allowed value in TaskCreationForm
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
