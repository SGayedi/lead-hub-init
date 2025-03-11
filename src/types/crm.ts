
export type Role = "investor_services" | "legal_services" | "property_development" | "senior_management";

export type InquiryType = "company" | "individual";

export type Priority = "high" | "medium" | "low";

export type LeadSource = "referral" | "website" | "direct" | "event" | "other";

export interface Lead {
  id: string;
  name: string;
  inquiryType: InquiryType;
  priority: Priority;
  source: LeadSource;
  exportQuota?: number;
  plotSize?: number;
  createdAt: string;
  updatedAt: string;
}
