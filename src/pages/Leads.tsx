
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/types/crm";

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Acme Corp",
    inquiryType: "company",
    priority: "high",
    source: "referral",
    exportQuota: 80,
    plotSize: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function Leads() {
  const [leads] = useState<Lead[]>(mockLeads);
  const { toast } = useToast();

  const getPriorityColor = (priority: Lead["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-crm-high-priority";
      case "medium":
        return "bg-crm-medium-priority";
      case "low":
        return "bg-crm-low-priority";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Button
          onClick={() =>
            toast({
              title: "Coming soon",
              description: "The create lead form will be implemented next",
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="animate-slide-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">{lead.name}</CardTitle>
              <div
                className={`${getPriorityColor(
                  lead.priority
                )} w-3 h-3 rounded-full`}
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Inquiry Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {lead.inquiryType}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Source</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {lead.source}
                  </p>
                </div>
                {lead.exportQuota && (
                  <div>
                    <p className="text-sm font-medium">Export Quota</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.exportQuota}%
                    </p>
                  </div>
                )}
                {lead.plotSize && (
                  <div>
                    <p className="text-sm font-medium">Plot Size</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.plotSize} hectares
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
