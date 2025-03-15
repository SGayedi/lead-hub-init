
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export default function AdminAuth() {
  const { adminUser, adminSignIn, adminLoading } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);

  // If already logged in, redirect to admin dashboard
  if (adminUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      await adminSignIn(formData.email, formData.password);
    } finally {
      setAuthLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-background relative">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Portal</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the administrative controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={authLoading}
            >
              {authLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Sign In to Admin Portal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
