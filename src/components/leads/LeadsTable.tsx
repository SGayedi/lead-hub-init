
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
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Lead } from "@/types/crm";
import { toast } from "sonner";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onViewDetails: (lead: Lead) => void;
}

export function LeadsTable({ leads, isLoading, onViewDetails }: LeadsTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'waiting_for_details': return 'bg-blue-100 text-blue-800';
      case 'waiting_for_approval': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'archived': return 'Archived';
      case 'waiting_for_details': return 'Waiting for Details';
      case 'waiting_for_approval': return 'Waiting for Approval';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Loading leads...
              </TableCell>
            </TableRow>
          ) : leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No leads found. Create your first lead to get started.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <button 
                    className="text-left hover:underline focus:outline-none focus:underline"
                    onClick={() => onViewDetails(lead)}
                  >
                    {lead.name}
                  </button>
                </TableCell>
                <TableCell>
                  {lead.inquiry_type === 'company' ? 'Company' : 'Individual'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(lead.priority)}
                  >
                    {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(lead.status)}
                  >
                    {getStatusLabel(lead.status)}
                  </Badge>
                </TableCell>
                <TableCell>{lead.email || '-'}</TableCell>
                <TableCell>
                  {new Date(lead.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => onViewDetails(lead)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {lead.status === 'waiting_for_approval' && (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          title="Approve"
                          onClick={() => toast.success("Approved! This functionality will be implemented soon.")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          title="Reject"
                          onClick={() => toast.error("Rejected! This functionality will be implemented soon.")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {lead.status === 'waiting_for_details' && (
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-8 w-8"
                        title="Mark as Complete"
                        onClick={() => toast.info("Soon you'll be able to update lead details here!")}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
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
