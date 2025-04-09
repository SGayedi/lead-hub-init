
import { format } from "date-fns";
import { Calendar, Users, Video } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  attendees?: string[];
  type?: string;
}

interface DashboardMeetingCardProps {
  meetings: Meeting[];
}

export function DashboardMeetingCard({ meetings }: DashboardMeetingCardProps) {
  const getMeetingTypeIcon = (type?: string) => {
    switch(type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'in-person':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-teal-500" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div 
          key={meeting.id} 
          className="flex items-start p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="mr-4 p-2 bg-muted/50 rounded-full">
            {getMeetingTypeIcon(meeting.type)}
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{meeting.title}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {format(new Date(meeting.startTime), "MMM d, h:mm a")}
              </p>
              {meeting.attendees && (
                <span className="text-xs text-muted-foreground">
                  {meeting.attendees.length} attendees
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
