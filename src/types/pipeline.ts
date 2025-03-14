
import { Lead, Opportunity } from "@/types/crm";

export interface PipelineStage {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  color: string | null;
  type: 'lead' | 'opportunity';
  created_at: string;
  updated_at: string;
}

export interface PipelineItem {
  id: string;
  name?: string;
  [key: string]: any;
}

export interface LeadPipelineItem extends PipelineItem {
  name: string;
  priority: string;
  status: string;
  inquiry_type: string;
  source: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface OpportunityPipelineItem extends PipelineItem {
  lead_id: string;
  lead_name: string;
  status: string;
  nda_status: string;
  business_plan_status: string;
  site_visit_scheduled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineColumn {
  id: string;
  name: string;
  items: PipelineItem[];
}

export interface LeadPipelineColumn extends PipelineColumn {
  items: LeadPipelineItem[];
}

export interface OpportunityPipelineColumn extends PipelineColumn {
  items: OpportunityPipelineItem[];
}

export type PipelineType = 'lead' | 'opportunity';
