
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Meeting, Task } from "@/types/crm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/Spinner";
import { MeetingsList } from "./MeetingsList";
import { TasksList } from "./TasksList";

interface SelectedDayDetailsProps {
  selectedDate: Date;
  meetings: Meeting[];
  tasks: Task[];
  isLoading: boolean;
}

export function SelectedDayDetails({ 
  selectedDate, 
  meetings, 
  tasks, 
  isLoading 
}: SelectedDayDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {format(selectedDate, 'MMMM d, yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (meetings.length === 0 && tasks.length === 0) ? (
          <p className="text-muted-foreground text-center py-8">
            No events scheduled for this date.
          </p>
        ) : (
          <div className="space-y-6">
            <MeetingsList meetings={meetings} />
            <TasksList tasks={tasks} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
