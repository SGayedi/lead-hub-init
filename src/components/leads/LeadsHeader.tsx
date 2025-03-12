
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadsHeaderProps {
  onCreateClick: () => void;
}

export function LeadsHeader({ onCreateClick }: LeadsHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage your leads and opportunities
        </p>
      </div>
      <Button 
        className="mt-4 md:mt-0" 
        onClick={onCreateClick}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Lead
      </Button>
    </header>
  );
}
