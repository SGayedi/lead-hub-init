
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConfigWarningProps {
  isConfigComplete: boolean;
  configError?: string | null;
}

export function ConfigWarning({ isConfigComplete, configError }: ConfigWarningProps) {
  if (isConfigComplete) return null;
  
  const specificError = configError 
    ? <p className="font-medium">{configError}</p> 
    : null;
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Microsoft OAuth Configuration Incomplete</AlertTitle>
      <AlertDescription className="space-y-2">
        {specificError}
        <p>The following environment variables need to be set in the Edge Function:</p>
        <ul className="list-disc pl-5 mt-2">
          <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">MS_CLIENT_ID</code> - Your Microsoft Azure App Client ID</li>
          <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">MS_CLIENT_SECRET</code> - Your Microsoft Azure App Client Secret</li>
          <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">REDIRECT_URI</code> - The URL to redirect to after authentication (should match your app URL)</li>
        </ul>
        <p className="text-sm mt-2">These must be configured in your Supabase Edge Function secrets.</p>
      </AlertDescription>
    </Alert>
  );
}
