
import { Meeting } from "@/types/crm";
import { format } from "date-fns";
import { AlertCircle, MapPin, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MeetingDetailsTabProps {
  meeting: Meeting;
}

export function MeetingDetailsTab({ meeting }: MeetingDetailsTabProps) {
  const getMeetingTypeColor = (type: string) => {
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
  
  const getMeetingTypeName = (type: string) => {
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
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Meeting Type</h3>
            <Badge variant="outline" className={getMeetingTypeColor(meeting.meetingType)}>
              {getMeetingTypeName(meeting.meetingType)}
            </Badge>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(meeting.startTime), 'MMMM d, yyyy')}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Time</h3>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(meeting.startTime), 'h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{meeting.location || 'No location specified'}</span>
            </div>
          </div>

          {meeting.leadId && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Related Lead</h3>
              <span>{meeting.leadName || 'Unknown lead'}</span>
            </div>
          )}
        </div>
      </div>
      
      {meeting.description && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
          <p className="text-sm whitespace-pre-line">{meeting.description}</p>
        </div>
      )}
      
      {meeting.notes && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Meeting Notes</h3>
          <div className="border rounded-md p-4 bg-muted/30">
            <p className="text-sm whitespace-pre-line">{meeting.notes}</p>
          </div>
        </div>
      )}
      
      {!meeting.notes && (
        <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>No meeting notes have been added yet.</p>
          <p className="text-sm">Notes can be added after the meeting.</p>
        </div>
      )}
    </div>
  );
}
