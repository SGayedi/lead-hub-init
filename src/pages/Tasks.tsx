
import React, { useState } from 'react';
import { PlusCircle, Search, Filter, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/TaskCard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TaskCreationForm } from "@/components/TaskCreationForm";
import { useTasks } from "@/hooks/useTasks";
import { TaskStatus, Priority } from "@/types/crm";
import { Spinner } from "@/components/Spinner";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'assigned_to_me' | 'created_by_me'>('all');
  
  const { tasks, isLoading } = useTasks({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter as Priority : undefined,
    onlyAssignedToMe: taskFilter === 'assigned_to_me',
    onlyCreatedByMe: taskFilter === 'created_by_me',
    searchTerm
  });
  
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and deadlines
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => setShowCreateDialog(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </header>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={priorityFilter} 
            onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={taskFilter} 
            onValueChange={(value) => setTaskFilter(value as 'all' | 'assigned_to_me' | 'created_by_me')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Task Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="assigned_to_me">Assigned to Me</SelectItem>
              <SelectItem value="created_by_me">Created by Me</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="kanban" className="mt-6">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No tasks found. Create your first task to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Column */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-1">
                    <span className="bg-yellow-100 w-3 h-3 rounded-full"></span>
                    Pending ({pendingTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {pendingTasks.length === 0 && (
                      <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                        No pending tasks
                      </div>
                    )}
                  </div>
                </div>
                
                {/* In Progress Column */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-1">
                    <span className="bg-blue-100 w-3 h-3 rounded-full"></span>
                    In Progress ({inProgressTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {inProgressTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {inProgressTasks.length === 0 && (
                      <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                        No tasks in progress
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Completed Column */}
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-1">
                    <span className="bg-green-100 w-3 h-3 rounded-full"></span>
                    Completed ({completedTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {completedTasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {completedTasks.length === 0 && (
                      <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
                        No completed tasks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No tasks found. Create your first task to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Create New Task</DialogTitle>
          <TaskCreationForm onSuccess={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
