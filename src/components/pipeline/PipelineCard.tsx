
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Calendar, 
  UserCircle, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { LeadPipelineItem, OpportunityPipelineItem, PipelineType } from '@/types/pipeline';
import { formatDistanceToNow } from 'date-fns';

interface PipelineCardProps {
  item: LeadPipelineItem | OpportunityPipelineItem;
  type: PipelineType;
}

export const PipelineCard = ({ item, type }: PipelineCardProps) => {
  const navigate = useNavigate();
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
      case 'waiting_for_approval': 
      case 'waiting_for_details': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'assessment_completed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'due_diligence_approved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };
  
  const handleViewDetails = () => {
    if (type === 'lead') {
      // Navigate to lead details
      navigate(`/leads?leadId=${item.id}`);
    } else {
      // Navigate to opportunity details
      navigate(`/opportunities?opportunityId=${item.id}`);
    }
  };
  
  return (
    <Card className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="font-medium text-sm truncate" style={{ maxWidth: '80%' }}>
            {type === 'lead' 
              ? (item as LeadPipelineItem).name 
              : (item as OpportunityPipelineItem).lead_name}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleViewDetails}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Add Task</DropdownMenuItem>
              {(item as LeadPipelineItem).email && (
                <DropdownMenuItem>Send Email</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-2 space-y-2">
          {type === 'lead' && (
            <>
              <div className="flex gap-1 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={getPriorityColor((item as LeadPipelineItem).priority)}
                >
                  {(item as LeadPipelineItem).priority}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(item.status)}
                >
                  {item.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              {(item as LeadPipelineItem).email && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate">
                  <Mail className="h-3 w-3 mr-1" />
                  {(item as LeadPipelineItem).email}
                </div>
              )}
            </>
          )}
          
          {type === 'opportunity' && (
            <>
              <div className="flex gap-1 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(item.status)}
                >
                  {item.status.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="dark:border-slate-700 dark:text-gray-300">
                  NDA: {(item as OpportunityPipelineItem).nda_status.replace(/_/g, ' ')}
                </Badge>
              </div>
              {(item as OpportunityPipelineItem).site_visit_scheduled && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  Site Visit Scheduled
                </div>
              )}
            </>
          )}
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            Updated {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
