
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfigWarningProps {
  isConfigComplete: boolean;
}

export function ConfigWarning({ isConfigComplete }: ConfigWarningProps) {
  if (isConfigComplete) return null;
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Microsoft OAuth configuration is incomplete. Please check the Edge Function environment variables.
      </AlertDescription>
    </Alert>
  );
}
