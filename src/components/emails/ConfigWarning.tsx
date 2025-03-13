
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
    ? <p className="font-medium text-red-500">{configError}</p> 
    : null;
  
  return (
    <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-900/20">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Microsoft OAuth Configuration Issue</AlertTitle>
      <AlertDescription className="space-y-2">
        {specificError}
        <p>The system is having trouble connecting to Microsoft. This could be because:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>The credentials are not being correctly loaded in the Edge Function</li>
          <li>The credentials are invalid or have expired</li>
          <li>The redirect URI may not match what's configured in your Azure portal</li>
        </ul>
        <p className="text-sm mt-2">Check the Edge Function logs for more detailed error information.</p>
      </AlertDescription>
    </Alert>
  );
}
