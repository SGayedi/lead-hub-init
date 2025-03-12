
import { useState } from "react";
import { isSameDay } from "date-fns";
import { Meeting, Task } from "@/types/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDay } from "./CalendarDay";
import { SelectedDayDetails } from "./SelectedDayDetails";

interface MonthViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  meetings: Meeting[];
  tasks: Task[];
  isLoading: boolean;
}

export function MonthView({ 
  selectedDate, 
  setSelectedDate, 
  meetings, 
  tasks, 
  isLoading 
}: MonthViewProps) {
  const meetingsForSelectedDate = meetings.filter(meeting => {
    if (!selectedDate) return false;
    return isSameDay(new Date(meeting.startTime), selectedDate);
  });

  const tasksForSelectedDate = tasks.filter(task => {
    if (!selectedDate || !task.dueDate) return false;
    return isSameDay(new Date(task.dueDate), selectedDate);
  });

  return (
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
                <div 
                  {...props} 
                  className="flex items-center justify-center p-0"
                  onClick={() => setSelectedDate(date)}
                >
                  <CalendarDay 
                    date={date} 
                    meetings={meetings} 
                    tasks={tasks}
                  />
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <SelectedDayDetails
          selectedDate={selectedDate}
          meetings={meetingsForSelectedDate}
          tasks={tasksForSelectedDate}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
