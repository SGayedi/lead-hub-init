
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Layout = () => {
  const [showSetupAlert, setShowSetupAlert] = useState(false);

  useEffect(() => {
    const checkEnvSetup = async () => {
      try {
        const response = await supabase.functions.invoke('microsoft-auth', {
          method: 'POST',
          body: { path: 'check-setup' },
        });
        
        setShowSetupAlert(response.error || 
          (response.data && response.data.status === 'incomplete'));
      } catch (error) {
        console.error("Error checking setup:", error);
        setShowSetupAlert(true);
      }
    };

    checkEnvSetup();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background">
        {showSetupAlert && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Microsoft Outlook Integration Setup Required</AlertTitle>
            <AlertDescription>
              The Microsoft OAuth credentials are not configured. Please set the MS_CLIENT_ID, 
              MS_CLIENT_SECRET and REDIRECT_URI environment variables in your Supabase Edge Function settings.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
