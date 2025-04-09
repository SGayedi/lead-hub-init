
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

// Sample data for the chart
const data = [
  { name: "Jan", leads: 20, opportunities: 12, deals: 5 },
  { name: "Feb", leads: 25, opportunities: 15, deals: 8 },
  { name: "Mar", leads: 30, opportunities: 18, deals: 10 },
  { name: "Apr", leads: 40, opportunities: 25, deals: 15 },
  { name: "May", leads: 45, opportunities: 30, deals: 18 },
  { name: "Jun", leads: 50, opportunities: 35, deals: 22 },
];

export function DashboardChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs font-medium"
            tick={{ fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            className="text-xs font-medium"
            tick={{ fill: "currentColor" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2 border shadow-md bg-background">
                    <p className="text-sm font-bold">{payload[0].payload.name}</p>
                    <p className="text-xs text-blue-500">
                      Leads: {payload[0].payload.leads}
                    </p>
                    <p className="text-xs text-purple-500">
                      Opportunities: {payload[0].payload.opportunities}
                    </p>
                    <p className="text-xs text-emerald-500">
                      Deals: {payload[0].payload.deals}
                    </p>
                  </Card>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="opportunities" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="deals" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
