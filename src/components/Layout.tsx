
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
            <AlertDescription className="space-y-4">
              <p>
                The Microsoft OAuth credentials are not configured. Please set the MS_CLIENT_ID, 
                MS_CLIENT_SECRET and REDIRECT_URI environment variables in your Supabase Edge Function settings.
              </p>
              <div className="text-sm space-y-2">
                <p className="font-medium">How to configure:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Register an application in the <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Microsoft Azure Portal <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                  <li>Set the redirect URI in Azure to the URL of your application + "/settings" (e.g., https://yourapp.com/settings)</li>
                  <li>Copy the Application (client) ID from Azure</li>
                  <li>Create a client secret in Azure</li>
                  <li>
                    Add these values to your Supabase Edge Function environment variables in the 
                    <a 
                      href="https://supabase.com/dashboard/project/gfsawddappbypvndmzwc/settings/functions"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline inline-flex items-center ml-1"
                    >
                      Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                </ol>
              </div>
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
