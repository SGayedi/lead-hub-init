
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Lock, Bell, HelpCircle, User, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setName(data.full_name || "");
          setEmail(data.email || user.email || "");
          setRole(data.role || "");
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
      }
    };
    
    loadUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          email: email,
        })
        .eq("id", user.id);
        
      if (profileError) throw profileError;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            Appearance
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Language
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Your role" disabled value={role} />
                </div>
                <Button 
                  className="w-fit" 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications when there's activity on your leads.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Approval Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a lead requires your approval.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Enquiry Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Be alerted when new enquiries are received.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-fit"
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred theme for the CRM interface.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-3 transition-all hover:border-primary ${theme === "light" ? "border-primary ring-2 ring-primary ring-offset-2" : ""}`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="h-24 w-full bg-[#FFFFFF] border rounded-md flex items-center justify-center">
                        <Sun className="h-8 w-8 text-black" />
                      </div>
                      <span className="font-medium">Light</span>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-3 transition-all hover:border-primary ${theme === "dark" ? "border-primary ring-2 ring-primary ring-offset-2" : ""}`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="h-24 w-full bg-[#1A1F2C] border rounded-md flex items-center justify-center">
                        <Moon className="h-8 w-8 text-white" />
                      </div>
                      <span className="font-medium">Dark</span>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-3 transition-all hover:border-primary ${theme === "system" ? "border-primary ring-2 ring-primary ring-offset-2" : ""}`}
                      onClick={() => setTheme("system")}
                    >
                      <div className="h-24 w-full bg-gradient-to-r from-[#FFFFFF] to-[#1A1F2C] border rounded-md flex items-center justify-center">
                        <div className="flex">
                          <Sun className="h-8 w-8 text-black" />
                          <Moon className="h-8 w-8 text-white ml-2" />
                        </div>
                      </div>
                      <span className="font-medium">System</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="language">Interface Language</Label>
                  <LanguageSelect />
                </div>
                <p className="text-sm text-muted-foreground">
                  The CRM supports English, Russian, Turkish, and Azerbaijani. 
                  Changing the language will update all interface text.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
