
export type Role = "investor_services" | "legal_services" | "property_development" | "senior_management";

export type InquiryType = "company" | "individual";

export type Priority = "high" | "medium" | "low";

export type LeadSource = "referral" | "website" | "direct" | "event" | "outlook" | "gmail" | "other";

export type LeadStatus = 
  | "active" 
  | "archived" 
  | "waiting_for_details" 
  | "waiting_for_approval" 
  | "rejected";

export interface Lead {
  id: string;
  name: string;
  inquiry_type: InquiryType;
  priority: Priority;
  source: LeadSource;
  status: LeadStatus;
  export_quota?: number;
  plot_size?: number;
  email?: string;
  phone?: string;
  notes?: string;
  outlook_email_id?: string;
  created_at: string;
  updated_at: string;
}

// New types for Version 4
export type OpportunityStatus = 
  | "assessment_in_progress" 
  | "assessment_completed" 
  | "waiting_for_approval" 
  | "due_diligence_approved" 
  | "rejected";

export type NdaStatus = 
  | "not_issued" 
  | "issued" 
  | "signed_by_investor" 
  | "counter_signed" 
  | "completed";

export type BusinessPlanStatus = 
  | "not_requested" 
  | "requested" 
  | "received" 
  | "updates_needed" 
  | "approved" 
  | "rejected";

export type ChecklistItemStatus = 
  | "not_started" 
  | "in_progress" 
  | "completed";

export interface Opportunity {
  id: string;
  lead_id: string;
  lead?: Lead;
  status: OpportunityStatus;
  nda_status: NdaStatus;
  business_plan_status: BusinessPlanStatus;
  business_plan_notes?: string;
  site_visit_scheduled: boolean;
  site_visit_date?: string;
  site_visit_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Nda {
  id: string;
  opportunity_id: string;
  version: number;
  status: NdaStatus;
  document_id?: string;
  issued_by?: string;
  issued_at: string;
  signed_at?: string;
  countersigned_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessPlan {
  id: string;
  opportunity_id: string;
  version: number;
  status: BusinessPlanStatus;
  document_id?: string;
  notes?: string;
  requested_by?: string;
  requested_at?: string;
  received_at?: string;
  feedback?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplateItem {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  is_required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DueDiligenceChecklist {
  id: string;
  opportunity_id: string;
  template_id?: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DueDiligenceChecklistItem {
  id: string;
  checklist_id: string;
  name: string;
  description?: string;
  status: ChecklistItemStatus;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface OutlookEmail {
  id: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  received_at: string;
  body: string;
  read: boolean;
  has_attachments: boolean;
  is_enquiry: boolean;
  associated_lead_id?: string;
}

export interface GmailEmail {
  id: string;
  subject: string;
  sender_name: string;
  sender_email: string;
  received_at: string;
  body: string;
  read: boolean;
  has_attachments: boolean;
  is_enquiry: boolean;
  associated_lead_id?: string;
}

export type Language = "en" | "ru" | "tr" | "az";

export interface Translation {
  [key: string]: {
    [lang in Language]: string;
  };
}

export type TaskStatus = "pending" | "in_progress" | "completed" | "canceled";

export type NotificationType = 
  | 'lead_inactive'
  | 'lead_archived'
  | 'task_created'
  | 'task_due_soon'
  | 'task_overdue'
  | 'meeting_scheduled'
  | 'lead_high_priority'
  | 'task_assigned'
  | 'meeting_reminder'
  | 'system_notification';

export type EntityType = "lead" | "task" | "meeting" | "document";

export type MeetingType = "first" | "technical" | "second" | "other";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string; 
  type: NotificationType;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'lead' | 'task' | 'meeting';
  createdAt: string;
  updatedAt: string;
  message?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedBy: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  relatedEntityId?: string;
  relatedEntityType?: "lead" | "meeting";
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingType: MeetingType;
  startTime: string;
  endTime: string;
  location?: string;
  leadId?: string;
  leadName?: string;
  createdBy: string;
  outcome?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  relatedEntityId: string;
  relatedEntityType: "lead" | "meeting";
  createdAt: string;
  updatedAt: string;
  version: number;
  versionHistory?: {
    version: number;
    path: string;
    uploadedAt: string;
    size: number;
  }[];
}

export interface Comment {
  id: string;
  content: string;
  createdBy: string;
  relatedEntityId: string;
  relatedEntityType: EntityType;
  createdAt: string;
  updatedAt: string;
}
