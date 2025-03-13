
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConfigWarningProps {
  isConfigComplete: boolean;
  configError?: string | null;
}

export function ConfigWarning({ isConfigComplete, configError }: ConfigWarningProps) {
  if (isConfigComplete) return null;
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Incomplete</AlertTitle>
      <AlertDescription>
        <p>{configError || "Microsoft OAuth configuration is incomplete. The following environment variables need to be set in the Edge Function:"}</p>
        <ul className="list-disc pl-5 mt-2">
          <li>MS_CLIENT_ID - Your Microsoft Azure App Client ID</li>
          <li>MS_CLIENT_SECRET - Your Microsoft Azure App Client Secret</li>
          <li>REDIRECT_URI - The URL to redirect to after authentication (should match your app URL)</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
