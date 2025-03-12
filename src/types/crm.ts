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
  | "lead_high_priority"
  | "lead_inactive"
  | "lead_archived"
  | "task_assigned"
  | "task_due_soon"
  | "meeting_reminder";

export type EntityType = "lead" | "task" | "meeting" | "document";

export type MeetingType = "first" | "technical" | "second" | "other";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: EntityType;
  createdAt: string;
  updatedAt: string;
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
  createdBy: string;
  outcome?: string;
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
