
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/crm";
import { toast } from "sonner";

export const useLeads = () => {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch leads");
        throw error;
      }

      return data as Lead[];
    }
  });

  const approveLead = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from("leads")
        .update({ status: "active" })
        .eq("id", leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead approved successfully");
    },
    onError: () => {
      toast.error("Failed to approve lead");
    }
  });

  const rejectLead = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from("leads")
        .update({ status: "rejected" })
        .eq("id", leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead rejected successfully");
    },
    onError: () => {
      toast.error("Failed to reject lead");
    }
  });

  const archiveLead = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from("leads")
        .update({ status: "archived" })
        .eq("id", leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead archived successfully");
    },
    onError: () => {
      toast.error("Failed to archive lead");
    }
  });

  return {
    leads,
    isLoading,
    approveLead,
    rejectLead,
    archiveLead
  };
};
