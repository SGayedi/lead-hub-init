
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Priority, Task } from '@/types/crm';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface TaskCreationFormProps {
  onSuccess?: () => void;
  relatedEntityId?: string;
  relatedEntityType?: "lead" | "meeting" | "opportunity";
}

export function TaskCreationForm({ 
  onSuccess,
  relatedEntityId,
  relatedEntityType 
}: TaskCreationFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    dueDate: undefined as Date | undefined,
  });
  
  const { createTask } = useTasks();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createTask.mutate({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate?.toISOString(),
      status: 'pending',
      relatedEntityId,
      relatedEntityType,
    }, {
      onSuccess: () => {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: undefined,
        });
        onSuccess?.();
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Task description"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select 
          value={formData.priority} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Priority }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.dueDate}
              onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createTask.isPending || !formData.title}
        >
          Create Task
        </Button>
      </div>
    </form>
  );
}
