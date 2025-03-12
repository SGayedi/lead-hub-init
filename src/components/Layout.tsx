
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Layout = () => {
  const [showSetupAlert, setShowSetupAlert] = useState(false);
  const [setupDetails, setSetupDetails] = useState<{
    client_id: boolean;
    client_secret: boolean;
    redirect_uri: boolean;
  }>({ client_id: false, client_secret: false, redirect_uri: false });

  useEffect(() => {
    const checkEnvSetup = async () => {
      try {
        const response = await supabase.functions.invoke('gmail-auth', {
          method: 'POST',
          body: { path: 'check-setup' },
        });
        
        setShowSetupAlert(response.error || 
          (response.data && response.data.status === 'incomplete'));
          
        // Store setup details if available
        if (response.data && response.data.details) {
          setSetupDetails(response.data.details);
        }
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
            <AlertTitle>Gmail Integration Setup Required</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                The Gmail OAuth credentials are not configured properly. Please check:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li className={setupDetails.client_id ? "text-green-500" : "text-red-500"}>
                  GMAIL_CLIENT_ID: {setupDetails.client_id ? "✓ Found" : "✗ Missing"}
                </li>
                <li className={setupDetails.client_secret ? "text-green-500" : "text-red-500"}>
                  GMAIL_CLIENT_SECRET: {setupDetails.client_secret ? "✓ Found" : "✗ Missing"}
                </li>
                <li className={setupDetails.redirect_uri ? "text-green-500" : "text-red-500"}>
                  REDIRECT_URI: {setupDetails.redirect_uri ? "✓ Found" : "✗ Missing"}
                </li>
              </ul>
              <div className="text-sm space-y-2">
                <p className="font-medium mt-2">How to fix this issue:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Verify the credentials are set in <code>supabase/functions/gmail-auth/config.toml</code></li>
                  <li>Deploy the edge function by running <code>npx supabase functions deploy gmail-auth</code> in your terminal</li>
                  <li>If you don't have Google OAuth credentials yet, follow these steps:</li>
                  <ol className="list-decimal pl-5 space-y-1 mt-1">
                    <li>Create a project in the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                    <li>Enable the Gmail API for your project</li>
                    <li>Create OAuth 2.0 credentials (OAuth client ID)</li>
                    <li>Set the redirect URI to the URL of your application + "/settings" (e.g., https://yourapp.com/settings)</li>
                    <li>Copy the Client ID and Client Secret</li>
                    <li>
                      Add these values to your <code>config.toml</code> file and deploy the function again
                    </li>
                  </ol>
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
