
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Lock, Bell, HelpCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();

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
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Your role" disabled value="Senior Management" />
                </div>
                <Button className="w-fit">Save Changes</Button>
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
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button className="w-fit">Update Password</Button>
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
