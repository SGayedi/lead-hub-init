
import { format } from "date-fns";
import { Lead } from "@/types/crm";

interface LeadDetailsTabProps {
  lead: Lead;
  isEditMode: boolean;
  editedLead: Partial<Lead>;
  setEditedLead: (lead: Partial<Lead>) => void;
}

export function LeadDetailsTab({ 
  lead, 
  isEditMode, 
  editedLead, 
  setEditedLead 
}: LeadDetailsTabProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP");
  };

  if (isEditMode) {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={editedLead.name || ""}
              onChange={(e) => setEditedLead({...editedLead, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={editedLead.email || ""}
              onChange={(e) => setEditedLead({...editedLead, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              value={editedLead.phone || ""}
              onChange={(e) => setEditedLead({...editedLead, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-type">Inquiry Type</Label>
            <Select 
              value={editedLead.inquiry_type || "individual"}
              onValueChange={(value) => setEditedLead({...editedLead, inquiry_type: value as InquiryType})}
            >
              <SelectTrigger id="inquiry-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select 
              value={editedLead.source || "website"}
              onValueChange={(value) => setEditedLead({...editedLead, source: value as LeadSource})}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={editedLead.status || "active"}
              onValueChange={(value) => setEditedLead({...editedLead, status: value as LeadStatus})}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="waiting_for_details">Waiting for Details</SelectItem>
                <SelectItem value="waiting_for_approval">Waiting for Approval</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={editedLead.priority || "medium"}
              onValueChange={(value) => setEditedLead({...editedLead, priority: value as Priority})}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-quota">Export Quota</Label>
            <Input 
              id="export-quota" 
              type="number"
              value={editedLead.export_quota?.toString() || ""}
              onChange={(e) => setEditedLead({...editedLead, export_quota: e.target.value ? parseInt(e.target.value, 10) : undefined})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plot-size">Plot Size</Label>
            <Input 
              id="plot-size" 
              type="number"
              value={editedLead.plot_size?.toString() || ""}
              onChange={(e) => setEditedLead({...editedLead, plot_size: e.target.value ? parseFloat(e.target.value) : undefined})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea 
            id="notes" 
            rows={5}
            value={editedLead.notes || ""}
            onChange={(e) => setEditedLead({...editedLead, notes: e.target.value})}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Created</h3>
          <p>{formatDate(lead.created_at)}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Updated</h3>
          <p>{formatDate(lead.updated_at)}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Source</h3>
          <p>{lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
          <p>{lead.email || "-"}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Phone</h3>
          <p>{lead.phone || "-"}</p>
        </div>
        {lead.export_quota && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Export Quota</h3>
            <p>{lead.export_quota}</p>
          </div>
        )}
        {lead.plot_size && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Plot Size</h3>
            <p>{lead.plot_size}</p>
          </div>
        )}
      </div>

      {lead.notes && (
        <div className="space-y-2 mt-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Notes</h3>
          <p className="whitespace-pre-line">{lead.notes}</p>
        </div>
      )}
    </>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InquiryType, LeadSource, LeadStatus, Priority } from "@/types/crm";
