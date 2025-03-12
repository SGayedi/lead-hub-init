
import React, { useState } from 'react';
import { PlusCircle, Search, Calendar, ClipboardList } from 'lucide-react';
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMeetings } from "@/hooks/useMeetings";
import { Meeting, MeetingType } from "@/types/crm";
import { Spinner } from "@/components/Spinner";
import { format } from "date-fns";
import { MeetingDetailsDialog } from "@/components/meetings/MeetingDetailsDialog";

// We'll create a simple meeting form for now
const MeetingForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="space-y-4">
      <p className="text-center">Meeting form will be implemented here</p>
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default function Meetings() {
  const [typeFilter, setTypeFilter] = useState<MeetingType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  
  const { meetings, isLoading } = useMeetings({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    searchTerm
  });
  
  const getMeetingTypeColor = (type: MeetingType) => {
    switch (type) {
      case 'first':
        return 'bg-blue-100 text-blue-800';
      case 'technical':
        return 'bg-purple-100 text-purple-800';
      case 'second':
        return 'bg-green-100 text-green-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getMeetingTypeName = (type: MeetingType) => {
    switch (type) {
      case 'first':
        return 'First Meeting';
      case 'technical':
        return 'Technical Meeting';
      case 'second':
        return 'Second Meeting';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and manage investor meetings
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => setShowCreateDialog(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </header>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={typeFilter} 
            onValueChange={(value) => setTypeFilter(value as MeetingType | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Meeting Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="first">First Meeting</SelectItem>
              <SelectItem value="technical">Technical Meeting</SelectItem>
              <SelectItem value="second">Second Meeting</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="calendar" className="mt-6">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-4">
            <div className="text-center py-10 text-muted-foreground">
              Calendar view will be implemented here using a date-picking library
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No meetings found. Schedule your first meeting to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map(meeting => (
                  <Card 
                    key={meeting.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleMeetingClick(meeting)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                        <Badge variant="outline" className={getMeetingTypeColor(meeting.meetingType)}>
                          {getMeetingTypeName(meeting.meetingType)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Date & Time
                          </div>
                          <div className="text-sm font-medium">
                            {format(new Date(meeting.startTime), 'MMMM d, yyyy')}
                          </div>
                          <div className="text-sm">
                            {format(new Date(meeting.startTime), 'h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Location
                          </div>
                          <div className="text-sm">
                            {meeting.location || 'No location specified'}
                          </div>
                        </div>
                      </div>
                      {meeting.description && (
                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            Description
                          </div>
                          <div className="text-sm line-clamp-2">
                            {meeting.description}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Schedule New Meeting</DialogTitle>
          <MeetingForm onClose={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      <MeetingDetailsDialog 
        meeting={selectedMeeting}
        isOpen={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
      />
    </div>
  );
}
