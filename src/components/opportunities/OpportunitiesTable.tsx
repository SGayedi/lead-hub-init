
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, Calendar, FileCheck } from "lucide-react";
import { Opportunity } from "@/types/crm";

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onViewDetails: (opportunity: Opportunity) => void;
}

export function OpportunitiesTable({ opportunities, isLoading, onViewDetails }: OpportunitiesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assessment_in_progress': return 'bg-blue-100 text-blue-800';
      case 'assessment_completed': return 'bg-yellow-100 text-yellow-800';
      case 'waiting_for_approval': return 'bg-purple-100 text-purple-800';
      case 'due_diligence_approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getNdaStatusColor = (status: string) => {
    switch (status) {
      case 'not_issued': return 'bg-gray-100 text-gray-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'signed_by_investor': return 'bg-yellow-100 text-yellow-800';
      case 'counter_signed': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getBusinessPlanStatusColor = (status: string) => {
    switch (status) {
      case 'not_requested': return 'bg-gray-100 text-gray-800';
      case 'requested': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-yellow-100 text-yellow-800';
      case 'updates_needed': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>NDA</TableHead>
            <TableHead>Business Plan</TableHead>
            <TableHead>Visit Scheduled</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                Loading opportunities...
              </TableCell>
            </TableRow>
          ) : opportunities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No opportunities found. Convert leads to opportunities to get started.
              </TableCell>
            </TableRow>
          ) : (
            opportunities.map((opportunity) => (
              <TableRow key={opportunity.id}>
                <TableCell className="font-medium">
                  <button 
                    className="text-left hover:underline focus:outline-none focus:underline"
                    onClick={() => onViewDetails(opportunity)}
                  >
                    {opportunity.lead?.name || 'Unknown Lead'}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(opportunity.status)}
                  >
                    {formatStatus(opportunity.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getNdaStatusColor(opportunity.nda_status)}
                  >
                    {formatStatus(opportunity.nda_status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getBusinessPlanStatusColor(opportunity.business_plan_status)}
                  >
                    {formatStatus(opportunity.business_plan_status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {opportunity.site_visit_scheduled ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-600 mr-1" />
                      {opportunity.site_visit_date ? 
                        new Date(opportunity.site_visit_date).toLocaleDateString() : 
                        'Scheduled'
                      }
                    </div>
                  ) : 'Not Scheduled'}
                </TableCell>
                <TableCell>
                  {new Date(opportunity.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => onViewDetails(opportunity)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {opportunity.status === 'waiting_for_approval' && (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
