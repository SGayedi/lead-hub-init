
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DayViewProps {
  selectedDate: Date | undefined;
}

export function DayView({ selectedDate }: DayViewProps) {
  return (
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
  );
}
