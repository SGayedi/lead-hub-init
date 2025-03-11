
export type Role = "investor_services" | "legal_services" | "property_development" | "senior_management";

export type InquiryType = "company" | "individual";

export type Priority = "high" | "medium" | "low";

export type LeadSource = "referral" | "website" | "direct" | "event" | "outlook" | "other";

export type LeadStatus = 
  | "active" 
  | "archived" 
  | "waiting_for_details" 
  | "waiting_for_approval" 
  | "rejected";

export interface Lead {
  id: string;
  name: string;
  inquiryType: InquiryType;
  priority: Priority;
  source: LeadSource;
  status: LeadStatus;
  exportQuota?: number;
  plotSize?: number;
  email?: string;
  phone?: string;
  notes?: string;
  outlookEmailId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutlookEmail {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  receivedAt: string;
  body: string;
  read: boolean;
  hasAttachments: boolean;
  isEnquiry: boolean;
  associatedLeadId?: string;
}

export type Language = "en" | "ru" | "tr" | "az";

export interface Translation {
  [key: string]: {
    [lang in Language]: string;
  };
}
