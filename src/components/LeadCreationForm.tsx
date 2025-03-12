import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { InquiryType, Priority, LeadSource } from "@/types/crm";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LeadCreationFormProps {
  initialData?: {
    name?: string;
    email?: string;
    notes?: string;
    source?: LeadSource;
  };
  onSuccess?: () => void;
}

export function LeadCreationForm({ initialData, onSuccess }: LeadCreationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    inquiryType: "company" as InquiryType,
    priority: "medium" as Priority,
    source: initialData?.source || "direct" as LeadSource,
    exportQuota: "",
    plotSize: "",
    email: initialData?.email || "",
    phone: "",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    // Core investor validation
    if (formData.priority === "high" && formData.inquiryType === "company") {
      if (formData.exportQuota && Number(formData.exportQuota) < 75) {
        newErrors.exportQuota = "Export quota must be at least 75% for core investors";
      }
      
      if (formData.plotSize && Number(formData.plotSize) < 1) {
        newErrors.plotSize = "Plot size must be at least 1 hectare for core investors";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const queryClient = useQueryClient();

  const createLead = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("leads")
        .insert([{
          name: data.name,
          inquiry_type: data.inquiryType,
          priority: data.priority,
          source: data.source,
          export_quota: data.exportQuota ? parseInt(data.exportQuota) : null,
          plot_size: data.plotSize ? parseFloat(data.plotSize) : null,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead created successfully");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Failed to create lead");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if this is a core investor with insufficient data
    const isCoreInvestor = formData.priority === "high" && formData.inquiryType === "company";
    const hasInsufficientData = 
      !formData.exportQuota || 
      !formData.plotSize || 
      Number(formData.exportQuota) < 75 || 
      Number(formData.plotSize) < 1;
    
    if (isCoreInvestor && hasInsufficientData) {
      const detailsToast = toast({
        title: "Insufficient Data for Core Investor",
        description: "This lead doesn't meet core investor criteria. How would you like to proceed?",
        action: (
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                createLead.mutate({
                  ...formData,
                  status: "waiting_for_details"
                });
                detailsToast.dismiss();
              }}
            >
              Wait for Details
            </Button>
            <Button 
              size="sm" 
              onClick={() => {
                createLead.mutate({
                  ...formData,
                  status: "waiting_for_approval"
                });
                detailsToast.dismiss();
              }}
            >
              Request Approval
            </Button>
          </div>
        ),
      });
      
      return;
    }
    
    createLead.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Company or Individual Name"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label>Inquiry Type <span className="text-red-500">*</span></Label>
        <RadioGroup
          value={formData.inquiryType}
          onValueChange={(value) => handleSelectChange("inquiryType", value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company">Company</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual">Individual</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
        <Select 
          value={formData.priority} 
          onValueChange={(value) => handleSelectChange("priority", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="source">Source <span className="text-red-500">*</span></Label>
        <Select 
          value={formData.source} 
          onValueChange={(value) => handleSelectChange("source", value as LeadSource)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="outlook">Outlook</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exportQuota">
            Export Quota (%)
            {formData.priority === "high" && formData.inquiryType === "company" && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Input
            id="exportQuota"
            name="exportQuota"
            value={formData.exportQuota}
            onChange={handleChange}
            type="number"
            placeholder="e.g. 80"
          />
          {errors.exportQuota && (
            <p className="text-sm text-red-500">{errors.exportQuota}</p>
          )}
          {formData.priority === "high" && formData.inquiryType === "company" && (
            <p className="text-xs text-muted-foreground">
              Must be at least 75% for core investors
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="plotSize">
            Plot Size (hectares)
            {formData.priority === "high" && formData.inquiryType === "company" && (
              <span className="text-red-500">*</span>
            )}
          </Label>
          <Input
            id="plotSize"
            name="plotSize"
            value={formData.plotSize}
            onChange={handleChange}
            type="number"
            step="0.1"
            placeholder="e.g. 1.5"
          />
          {errors.plotSize && (
            <p className="text-sm text-red-500">{errors.plotSize}</p>
          )}
          {formData.priority === "high" && formData.inquiryType === "company" && (
            <p className="text-xs text-muted-foreground">
              Must be at least 1 hectare for core investors
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="example@company.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional information about this lead..."
          rows={4}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">Create Lead</Button>
      </div>
    </form>
  );
}
