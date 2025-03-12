
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Meeting } from "@/types/crm";
import { Badge } from "@/components/ui/badge";

interface MeetingsListProps {
  meetings: Meeting[];
}

export function MeetingsList({ meetings }: MeetingsListProps) {
  if (meetings.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
        <Users className="h-4 w-4" />
        Meetings
      </h3>
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{meeting.title}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(meeting.startTime), 'h:mm a')} - {format(new Date(meeting.endTime), 'h:mm a')}
              </p>
              {meeting.location && (
                <p className="text-xs text-muted-foreground mt-1">
                  Location: {meeting.location}
                </p>
              )}
            </div>
            <Badge variant="outline">{meeting.meetingType}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
