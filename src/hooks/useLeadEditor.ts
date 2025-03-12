
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/crm";
import { toast } from "sonner";

export function useLeadEditor(lead: Lead | null, onLeadUpdated?: () => void) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setEditedLead(lead);
    }
  }, [lead]);

  const handleSave = async () => {
    if (!lead) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          name: editedLead.name,
          email: editedLead.email,
          phone: editedLead.phone,
          status: editedLead.status,
          priority: editedLead.priority,
          inquiry_type: editedLead.inquiry_type,
          source: editedLead.source,
          export_quota: editedLead.export_quota,
          plot_size: editedLead.plot_size,
          notes: editedLead.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", lead.id);

      if (error) throw error;
      
      toast.success("Lead updated successfully");
      setIsEditMode(false);
      
      // Call the callback to refresh leads if provided
      if (onLeadUpdated) {
        onLeadUpdated();
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedLead(lead || {});
  };

  return {
    isEditMode,
    setIsEditMode,
    isSaving,
    editedLead,
    setEditedLead,
    handleSave,
    handleCancel
  };
}
