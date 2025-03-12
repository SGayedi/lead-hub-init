
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Users, CheckCircle2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMeetings } from "@/hooks/useMeetings";
import { useTasks } from "@/hooks/useTasks";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { Spinner } from "@/components/Spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/crm";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "day">("month");
  const [monthStart, setMonthStart] = useState<Date>(startOfMonth(new Date()));
  const [monthEnd, setMonthEnd] = useState<Date>(endOfMonth(new Date()));

  // Update month range when selected date changes
  useEffect(() => {
    if (selectedDate) {
      setMonthStart(startOfMonth(selectedDate));
      setMonthEnd(endOfMonth(selectedDate));
    }
  }, [selectedDate]);

  // Fetch meetings for the entire month
  const { meetings, isLoading: isLoadingMeetings } = useMeetings({
    startDate: monthStart,
    endDate: monthEnd,
  });

  // Fetch tasks for the entire month
  const { tasks, isLoading: isLoadingTasks } = useTasks({
    startDate: monthStart,
    endDate: monthEnd,
  });

  const meetingsForSelectedDate = meetings.filter(meeting => {
    if (!selectedDate) return false;
    return isSameDay(new Date(meeting.startTime), selectedDate);
  });

  const tasksForSelectedDate = tasks.filter(task => {
    if (!selectedDate || !task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), selectedDate);
  });

  // Custom day rendering for the calendar
  const renderDay = (date: Date) => {
    const dayMeetings = meetings.filter(meeting => 
      isSameDay(new Date(meeting.startTime), date)
    );
    
    const dayTasks = tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );

    const hasEvents = dayMeetings.length > 0 || dayTasks.length > 0;

    return (
      <div className="h-14 w-14 p-0 relative flex flex-col items-center justify-center">
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
  };

  return (
    <div className="p-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View your meetings and tasks</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant={calendarView === "month" ? "default" : "outline"} 
            size="sm"
            onClick={() => setCalendarView("month")}
          >
            Month
          </Button>
          <Button 
            variant={calendarView === "day" ? "default" : "outline"} 
            size="sm"
            onClick={() => setCalendarView("day")}
          >
            Day
          </Button>
        </div>
      </header>

      {calendarView === "month" ? (
        <div className="grid grid-rows-[auto_1fr] gap-6">
          <Card className="p-0 overflow-hidden">
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  Day: ({ date, ...props }) => (
                    <button {...props}>
                      {renderDay(date)}
                    </button>
                  ),
                }}
              />
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(isLoadingMeetings || isLoadingTasks) ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : (meetingsForSelectedDate.length === 0 && tasksForSelectedDate.length === 0) ? (
                  <p className="text-muted-foreground text-center py-8">
                    No events scheduled for this date.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {meetingsForSelectedDate.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                          <Users className="h-4 w-4" />
                          Meetings
                        </h3>
                        <div className="space-y-3">
                          {meetingsForSelectedDate.map((meeting) => (
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
                    )}

                    {tasksForSelectedDate.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-4 w-4" />
                          Tasks
                        </h3>
                        <div className="space-y-3">
                          {tasksForSelectedDate.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <h3 className="font-medium">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {task.description.length > 100 
                                      ? `${task.description.substring(0, 100)}...` 
                                      : task.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge 
                                  variant="outline" 
                                  className={
                                    task.priority === "high" 
                                      ? "bg-red-50 text-red-700 border-red-200" 
                                      : task.priority === "medium"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }
                                >
                                  {task.priority}
                                </Badge>
                                <Badge 
                                  variant="outline"
                                  className={
                                    task.status === "completed" 
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : task.status === "in_progress"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                                  }
                                >
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Daily View: {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[600px]">
            {/* Daily view content goes here */}
            <p>Daily view content to be implemented</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
