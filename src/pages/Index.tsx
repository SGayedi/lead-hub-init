import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { User, Users, Building2, PieChart, ArrowRight } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { adminUser } = useAdminAuth();

  // Redirect based on user type
  useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard');
    } else if (user) {
      navigate('/leads');
    }
  }, [user, adminUser, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to the CRM System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage leads, opportunities, meetings, and tasks in one integrated platform
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              <User className="mr-2 h-5 w-5" />
              Login / Register
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Lead Management</CardTitle>
              <CardDescription>Track and manage potential clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Users className="h-12 w-12 mb-4 text-primary opacity-80" />
              <p className="text-sm text-muted-foreground">
                Organize leads by status, priority, and source. Capture all essential information in one place.
              </p>
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Opportunity Tracking</CardTitle>
              <CardDescription>Convert leads to opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <Building2 className="h-12 w-12 mb-4 text-primary opacity-80" />
              <p className="text-sm text-muted-foreground">
                Manage the complete sales pipeline from initial contact to closing deals.
              </p>
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Task Management</CardTitle>
              <CardDescription>Stay organized and productive</CardDescription>
            </CardHeader>
            <CardContent>
              <Users className="h-12 w-12 mb-4 text-primary opacity-80" />
              <p className="text-sm text-muted-foreground">
                Create tasks, set deadlines, and track progress to ensure nothing falls through the cracks.
              </p>
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Analytics</CardTitle>
              <CardDescription>Insights that drive decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart className="h-12 w-12 mb-4 text-primary opacity-80" />
              <p className="text-sm text-muted-foreground">
                Get actionable insights with detailed reports and performance metrics.
              </p>
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
