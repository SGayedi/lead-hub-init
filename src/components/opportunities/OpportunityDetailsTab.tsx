
import { useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Opportunity } from "@/types/crm";
import { toast } from "sonner";

interface OpportunityDetailsTabProps {
  opportunity: Opportunity;
  onUpdated?: () => void;
}

export function OpportunityDetailsTab({ opportunity, onUpdated }: OpportunityDetailsTabProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [siteVisitScheduled, setSiteVisitScheduled] = useState(opportunity.site_visit_scheduled);
  const [siteVisitDate, setSiteVisitDate] = useState(opportunity.site_visit_date || '');
  const [siteVisitNotes, setSiteVisitNotes] = useState(opportunity.site_visit_notes || '');
  const queryClient = useQueryClient();

  const updateOpportunityMutation = useMutation({
    mutationFn: async (data: {
      site_visit_scheduled: boolean;
      site_visit_date?: string;
      site_visit_notes?: string;
    }) => {
      const { error } = await supabase
        .from('opportunities')
        .update(data)
        .eq('id', opportunity.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Opportunity details updated successfully');
      setIsEditMode(false);
      if (onUpdated) {
        onUpdated();
      }
    },
    onError: (error) => {
      toast.error(`Failed to update opportunity: ${error.message}`);
    }
  });

  const handleSave = () => {
    updateOpportunityMutation.mutate({
      site_visit_scheduled: siteVisitScheduled,
      site_visit_date: siteVisitDate || null,
      site_visit_notes: siteVisitNotes || null
    });
  };

  const handleCancel = () => {
    setSiteVisitScheduled(opportunity.site_visit_scheduled);
    setSiteVisitDate(opportunity.site_visit_date || '');
    setSiteVisitNotes(opportunity.site_visit_notes || '');
    setIsEditMode(false);
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Opportunity Details</h3>
        <div>
          {!isEditMode ? (
            <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm">
              Edit Details
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={updateOpportunityMutation.isPending}
              >
                Save Changes
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="sm"
                disabled={updateOpportunityMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
            <CardDescription>Details about the associated lead</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <div className="font-medium mt-1">{opportunity.lead?.name || 'N/A'}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="font-medium mt-1">{opportunity.lead?.email || 'N/A'}</div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="font-medium mt-1">{opportunity.lead?.phone || 'N/A'}</div>
            </div>
            <div>
              <Label>Type</Label>
              <div className="font-medium mt-1 capitalize">{opportunity.lead?.inquiry_type || 'N/A'}</div>
            </div>
            <div>
              <Label>Priority</Label>
              <div className="font-medium mt-1 capitalize">{opportunity.lead?.priority || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Due Diligence Progress</CardTitle>
            <CardDescription>Status of the due diligence process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Status</Label>
              <div className="font-medium mt-1">
                <Badge className="capitalize">{formatStatus(opportunity.status)}</Badge>
              </div>
            </div>
            <div>
              <Label>NDA Status</Label>
              <div className="font-medium mt-1">
                <Badge className="capitalize">{formatStatus(opportunity.nda_status)}</Badge>
              </div>
            </div>
            <div>
              <Label>Business Plan Status</Label>
              <div className="font-medium mt-1">
                <Badge className="capitalize">{formatStatus(opportunity.business_plan_status)}</Badge>
              </div>
            </div>
            <div>
              <Label>Created On</Label>
              <div className="font-medium mt-1">{new Date(opportunity.created_at).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site Visit</CardTitle>
          <CardDescription>Schedule and manage on-site visits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditMode ? (
            <>
              <div className="flex items-center gap-2">
                <Label>Site Visit Scheduled</Label>
                <Badge variant={opportunity.site_visit_scheduled ? "success" : "secondary"}>
                  {opportunity.site_visit_scheduled ? 'Yes' : 'No'}
                </Badge>
              </div>
              {opportunity.site_visit_scheduled && (
                <>
                  {opportunity.site_visit_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(opportunity.site_visit_date).toLocaleDateString()} at{' '}
                        {new Date(opportunity.site_visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {opportunity.site_visit_notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="mt-1">{opportunity.site_visit_notes}</p>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="site-visit-scheduled"
                  checked={siteVisitScheduled}
                  onChange={(e) => setSiteVisitScheduled(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="site-visit-scheduled">Site Visit Scheduled</Label>
              </div>
              {siteVisitScheduled && (
                <>
                  <div>
                    <Label htmlFor="site-visit-date">Visit Date and Time</Label>
                    <Input
                      id="site-visit-date"
                      type="datetime-local"
                      value={siteVisitDate}
                      onChange={(e) => setSiteVisitDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="site-visit-notes">Visit Notes</Label>
                    <Textarea
                      id="site-visit-notes"
                      value={siteVisitNotes}
                      onChange={(e) => setSiteVisitNotes(e.target.value)}
                      className="mt-1"
                      placeholder="Enter site visit details, location, participants, etc."
                    />
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
