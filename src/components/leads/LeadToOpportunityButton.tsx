
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Lead } from "@/types/crm";
import { Loader2 } from "lucide-react";

interface LeadToOpportunityButtonProps {
  lead: Lead;
  onSuccess?: () => void;
}

export function LeadToOpportunityButton({ lead, onSuccess }: LeadToOpportunityButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const convertToOpportunity = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      try {
        // Call the Supabase function to convert lead to opportunity
        const { data, error } = await supabase.rpc(
          'convert_lead_to_opportunity',
          { lead_id_param: lead.id }
        );

        if (error) {
          console.error("Conversion error:", error);
          throw new Error(error.message || "Failed to convert lead");
        }
        
        if (!data) {
          throw new Error("No data returned from conversion");
        }
        
        return data;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      toast.success(`Lead "${lead.name}" has been converted to an opportunity`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to convert lead: ${error.message}`);
      console.error("Conversion error details:", error);
    },
  });

  // Disable button if lead is already archived or not active
  const isDisabled = !user || lead.status === 'archived' || isProcessing;

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => convertToOpportunity.mutate()}
      disabled={isDisabled}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Converting...
        </>
      ) : (
        'Convert to Opportunity'
      )}
    </Button>
  );
}
