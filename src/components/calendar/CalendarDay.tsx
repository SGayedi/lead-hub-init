
import { isSameDay } from "date-fns";
import { Meeting, Task } from "@/types/crm";

interface CalendarDayProps {
  date: Date;
  meetings: Meeting[];
  tasks: Task[];
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export function CalendarDay({ date, meetings, tasks, onClick }: CalendarDayProps) {
  const dayMeetings = meetings.filter(meeting => 
    isSameDay(new Date(meeting.startTime), date)
  );
  
  const dayTasks = tasks.filter(task => 
    task.dueDate && isSameDay(new Date(task.dueDate), date)
  );

  const hasEvents = dayMeetings.length > 0 || dayTasks.length > 0;

  return (
    <div 
      className="h-14 w-14 p-0 relative flex flex-col items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      <span>{date.getDate()}</span>
      {hasEvents && (
        <div className="absolute bottom-1 flex gap-1">
          {dayMeetings.length > 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          )}
          {dayTasks.length > 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
          )}
        </div>
      )}
    </div>
  );
}
