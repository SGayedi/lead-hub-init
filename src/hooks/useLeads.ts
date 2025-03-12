
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/crm";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export const useLeads = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch leads");
        throw error;
      }

      return data as Lead[];
    },
    enabled: !!user
  });

  const approveLead = useMutation({
    mutationFn: async (leadId: string) => {
      if (!user) throw new Error("User not authenticated");
      
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
      if (!user) throw new Error("User not authenticated");
      
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
      if (!user) throw new Error("User not authenticated");
      
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
