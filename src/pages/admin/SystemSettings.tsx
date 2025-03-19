import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { AppearanceSettings } from "@/components/admin/AppearanceSettings";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
}

export default function SystemSettings() {
  const { adminUser } = useAdminAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form values
  const [companyName, setCompanyName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
  const [defaultRole, setDefaultRole] = useState("investor_services");
  const [sessionTimeout, setSessionTimeout] = useState("1440"); // 24 hours in minutes
  
  // Appearance settings
  const [interfaceDensity, setInterfaceDensity] = useState("comfortable");

  useEffect(() => {
    if (adminUser) {
      fetchSettings();
    }
  }, [adminUser]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      
      setSettings(data || []);
      
      // Initialize form values from settings
      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
      
      setCompanyName(settingsMap.company_name?.value || "CRM System");
      setSupportEmail(settingsMap.support_email?.value || "support@example.com");
      setEnableRegistration(settingsMap.enable_registration?.value ?? true);
      setEmailVerificationRequired(settingsMap.email_verification_required?.value ?? true);
      setDefaultRole(settingsMap.default_role?.value || "investor_services");
      setSessionTimeout(settingsMap.session_timeout?.value?.toString() || "1440");
      
      // Initialize appearance settings
      setInterfaceDensity(settingsMap.interface_density?.value || "comfortable");
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!adminUser) return;
    
    try {
      setIsSaving(true);
      
      // Prepare settings objects with their keys
      const settingsToSave = [
        {
          key: 'company_name',
          value: { value: companyName },
          description: 'Company name displayed in the app'
        },
        {
          key: 'support_email',
          value: { value: supportEmail },
          description: 'Support email address'
        },
        {
          key: 'enable_registration',
          value: { value: enableRegistration },
          description: 'Allow new user registrations'
        },
        {
          key: 'email_verification_required',
          value: { value: emailVerificationRequired },
          description: 'Require email verification for new accounts'
        },
        {
          key: 'default_role',
          value: { value: defaultRole },
          description: 'Default role for new users'
        },
        {
          key: 'session_timeout',
          value: { value: parseInt(sessionTimeout) },
          description: 'Session timeout in minutes'
        },
        // Appearance settings
        {
          key: 'interface_density',
          value: { value: interfaceDensity },
          description: 'UI density (comfortable or compact)'
        }
      ];
      
      // Get existing settings keys for comparison
      const existingSettingsMap = new Map(settings.map(s => [s.key, s.id]));
      
      // Process each setting
      for (const setting of settingsToSave) {
        if (existingSettingsMap.has(setting.key)) {
          // Update existing setting
          const { error } = await supabase
            .from('system_settings')
            .update({
              value: setting.value,
              updated_by: adminUser.id
            })
            .eq('key', setting.key);
          
          if (error) throw error;
        } else {
          // Insert new setting
          const { error } = await supabase
            .from('system_settings')
            .insert({
              key: setting.key,
              value: setting.value,
              description: setting.description,
              updated_by: adminUser.id
            });
          
          if (error) throw error;
        }
      }
      
      // Log the changes
      await supabase.from('audit_logs').insert({
        action: 'update_system_settings',
        entity_type: 'system_settings',
        performed_by: adminUser.id,
        is_admin: true,
        user_agent: navigator.userAgent,
        changes: settingsToSave.reduce((acc, setting) => {
          acc[setting.key] = setting.value.value;
          return acc;
        }, {} as Record<string, any>),
      });
      
      toast.success('System settings saved successfully');
      fetchSettings(); // Refresh settings
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure global settings for your CRM
        </p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic settings for your CRM system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure how users authenticate with the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-registration">Enable Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to create new accounts
                  </p>
                </div>
                <Switch
                  id="enable-registration"
                  checked={enableRegistration}
                  onCheckedChange={setEnableRegistration}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-verification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the system
                  </p>
                </div>
                <Switch
                  id="email-verification"
                  checked={emailVerificationRequired}
                  onCheckedChange={setEmailVerificationRequired}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-role">Default User Role</Label>
                <select
                  id="default-role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={defaultRole}
                  onChange={(e) => setDefaultRole(e.target.value)}
                >
                  <option value="investor_services">Investor Services</option>
                  <option value="legal_services">Legal Services</option>
                  <option value="property_development">Property Development</option>
                  <option value="senior_management">Senior Management</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="5"
                  max="10080" // 7 days
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Configure the look and feel of your CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppearanceSettings 
                interfaceDensity={interfaceDensity}
                onDensityChange={setInterfaceDensity}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
