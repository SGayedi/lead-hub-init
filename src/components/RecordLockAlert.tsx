
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";

interface RecordLockAlertProps {
  lockedBy: {
    name: string;
    email: string;
  };
  expiresAt: string;
}

export function RecordLockAlert({ lockedBy, expiresAt }: RecordLockAlertProps) {
  const timeRemaining = formatDistanceToNow(new Date(expiresAt), { addSuffix: true });
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>This record is currently being edited</AlertTitle>
      <AlertDescription className="mt-2">
        <p>
          This record is currently being edited by <strong>{lockedBy.name}</strong> ({lockedBy.email}) 
          and will be available {timeRemaining}.
        </p>
        <p className="mt-2 flex items-center text-sm">
          <Clock className="h-3 w-3 mr-1" /> You can try again when the lock expires.
        </p>
      </AlertDescription>
    </Alert>
  );
}
