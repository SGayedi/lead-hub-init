import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/hooks/useMeetings";
import { useTasks } from "@/hooks/useTasks";
import { MonthView } from "@/components/calendar/MonthView";
import { DayView } from "@/components/calendar/DayView";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "day">("month");
  const [monthStart, setMonthStart] = useState<Date>(startOfMonth(new Date()));
  const [monthEnd, setMonthEnd] = useState<Date>(endOfMonth(new Date()));

  useEffect(() => {
    if (selectedDate) {
      setMonthStart(startOfMonth(selectedDate));
      setMonthEnd(endOfMonth(selectedDate));
    }
  }, [selectedDate]);

  const { meetings, isLoading: isLoadingMeetings } = useMeetings({
    startDate: monthStart,
    endDate: monthEnd,
  });

  const { tasks, isLoading: isLoadingTasks } = useTasks({
    startDate: monthStart,
    endDate: monthEnd,
  });

  return (
    <div className="p-6 animate-fade-in">
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
        <MonthView
          selectedDate={selectedDate!}
          setSelectedDate={setSelectedDate}
          meetings={meetings}
          tasks={tasks}
          isLoading={isLoadingMeetings || isLoadingTasks}
        />
      ) : (
        <DayView selectedDate={selectedDate} />
      )}
    </div>
  );
}
