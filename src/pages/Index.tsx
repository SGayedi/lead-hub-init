
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate("/leads")}>View Leads</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <span>Lead Statistics</span>
            </CardTitle>
            <CardDescription>Overview of your current leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Leads</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Closed</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              <span>Performance</span>
            </CardTitle>
            <CardDescription>Your monthly conversion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="text-2xl font-bold">32%</div>
                <div className="text-xs text-muted-foreground">+4.3% from last month</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => navigate("/leads")}>
                Manage Leads
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/enquiries")}>
                View Enquiries
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/settings")}>
                Account Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
