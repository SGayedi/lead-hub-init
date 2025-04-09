export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_login: string | null
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_login?: string | null
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          is_admin: boolean
          performed_by: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          is_admin?: boolean
          performed_by: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          is_admin?: boolean
          performed_by?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      business_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          document_id: string | null
          feedback: string | null
          id: string
          notes: string | null
          opportunity_id: string
          received_at: string | null
          requested_at: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["business_plan_status"]
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_id?: string | null
          feedback?: string | null
          id?: string
          notes?: string | null
          opportunity_id: string
          received_at?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["business_plan_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          document_id?: string | null
          feedback?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          received_at?: string | null
          requested_at?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["business_plan_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_plans_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_required: boolean | null
          name: string
          order_index: number
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          order_index: number
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          order_index?: number
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          related_entity_id: string
          related_entity_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          related_entity_id: string
          related_entity_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          related_entity_id?: string
          related_entity_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_stats: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
          related_entity_id: string
          related_entity_type: string
          updated_at: string
          uploaded_by: string
          version: number
          version_history: Json[] | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
          related_entity_id: string
          related_entity_type: string
          updated_at?: string
          uploaded_by: string
          version?: number
          version_history?: Json[] | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
          related_entity_id?: string
          related_entity_type?: string
          updated_at?: string
          uploaded_by?: string
          version?: number
          version_history?: Json[] | null
        }
        Relationships: []
      }
      dropdown_options: {
        Row: {
          category: string
          created_at: string
          display_name: string
          id: string
          is_default: boolean | null
          order_index: number | null
          updated_at: string
          value: string
        }
        Insert: {
          category: string
          created_at?: string
          display_name: string
          id?: string
          is_default?: boolean | null
          order_index?: number | null
          updated_at?: string
          value: string
        }
        Update: {
          category?: string
          created_at?: string
          display_name?: string
          id?: string
          is_default?: boolean | null
          order_index?: number | null
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      due_diligence_checklist_items: {
        Row: {
          assigned_to: string | null
          checklist_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          notes: string | null
          order_index: number
          status: Database["public"]["Enums"]["checklist_item_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          checklist_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index: number
          status?: Database["public"]["Enums"]["checklist_item_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          checklist_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          status?: Database["public"]["Enums"]["checklist_item_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "due_diligence_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence_checklists: {
        Row: {
          created_at: string
          id: string
          name: string
          opportunity_id: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          opportunity_id: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          opportunity_id?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_checklists_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "due_diligence_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          export_quota: number | null
          id: string
          inquiry_type: string
          name: string
          notes: string | null
          phone: string | null
          plot_size: number | null
          priority: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          export_quota?: number | null
          id?: string
          inquiry_type: string
          name: string
          notes?: string | null
          phone?: string | null
          plot_size?: number | null
          priority: string
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          export_quota?: number | null
          id?: string
          inquiry_type?: string
          name?: string
          notes?: string | null
          phone?: string | null
          plot_size?: number | null
          priority?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          lead_id: string | null
          location: string | null
          meeting_type: string
          outcome: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          lead_id?: string | null
          location?: string | null
          meeting_type: string
          outcome?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          lead_id?: string | null
          location?: string | null
          meeting_type?: string
          outcome?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ndas: {
        Row: {
          completed_at: string | null
          countersigned_at: string | null
          created_at: string
          document_id: string | null
          id: string
          issued_at: string
          issued_by: string | null
          opportunity_id: string
          signed_at: string | null
          status: Database["public"]["Enums"]["nda_status"]
          updated_at: string
          version: number
        }
        Insert: {
          completed_at?: string | null
          countersigned_at?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          opportunity_id: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["nda_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          completed_at?: string | null
          countersigned_at?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          opportunity_id?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["nda_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ndas_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ndas_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          business_plan_notes: string | null
          business_plan_status: Database["public"]["Enums"]["business_plan_status"]
          created_at: string
          id: string
          lead_id: string
          nda_status: Database["public"]["Enums"]["nda_status"]
          site_visit_date: string | null
          site_visit_notes: string | null
          site_visit_scheduled: boolean | null
          status: Database["public"]["Enums"]["opportunity_status"]
          updated_at: string
        }
        Insert: {
          business_plan_notes?: string | null
          business_plan_status?: Database["public"]["Enums"]["business_plan_status"]
          created_at?: string
          id?: string
          lead_id: string
          nda_status?: Database["public"]["Enums"]["nda_status"]
          site_visit_date?: string | null
          site_visit_notes?: string | null
          site_visit_scheduled?: boolean | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
        }
        Update: {
          business_plan_notes?: string | null
          business_plan_status?: Database["public"]["Enums"]["business_plan_status"]
          created_at?: string
          id?: string
          lead_id?: string
          nda_status?: Database["public"]["Enums"]["nda_status"]
          site_visit_date?: string | null
          site_visit_notes?: string | null
          site_visit_scheduled?: boolean | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_approvals: {
        Row: {
          approved_at: string
          approved_by: string
          comments: string | null
          created_at: string
          id: string
          is_final: boolean
          opportunity_id: string
          stage: string
          updated_at: string
        }
        Insert: {
          approved_at?: string
          approved_by: string
          comments?: string | null
          created_at?: string
          id?: string
          is_final?: boolean
          opportunity_id: string
          stage: string
          updated_at?: string
        }
        Update: {
          approved_at?: string
          approved_by?: string
          comments?: string | null
          created_at?: string
          id?: string
          is_final?: boolean
          opportunity_id?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_approvals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      outlook_emails: {
        Row: {
          associated_lead_id: string | null
          body: string
          created_at: string
          has_attachments: boolean
          id: string
          is_enquiry: boolean
          read: boolean
          received_at: string
          sender_email: string
          sender_name: string
          subject: string
          updated_at: string
        }
        Insert: {
          associated_lead_id?: string | null
          body: string
          created_at?: string
          has_attachments?: boolean
          id: string
          is_enquiry?: boolean
          read?: boolean
          received_at: string
          sender_email: string
          sender_name: string
          subject: string
          updated_at?: string
        }
        Update: {
          associated_lead_id?: string | null
          body?: string
          created_at?: string
          has_attachments?: boolean
          id?: string
          is_enquiry?: boolean
          read?: boolean
          received_at?: string
          sender_email?: string
          sender_name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outlook_emails_associated_lead_id_fkey"
            columns: ["associated_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      outlook_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: number
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: number
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: number
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      record_locks: {
        Row: {
          entity_id: string
          entity_type: string
          expires_at: string
          id: string
          locked_at: string
          locked_by: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          expires_at: string
          id?: string
          locked_at?: string
          locked_by: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          expires_at?: string
          id?: string
          locked_at?: string
          locked_by?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          az: string | null
          created_at: string
          en: string
          id: string
          key: string
          ru: string | null
          tr: string | null
          updated_at: string
        }
        Insert: {
          az?: string | null
          created_at?: string
          en: string
          id?: string
          key: string
          ru?: string | null
          tr?: string | null
          updated_at?: string
        }
        Update: {
          az?: string | null
          created_at?: string
          en?: string
          id?: string
          key?: string
          ru?: string | null
          tr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_record_lock: {
        Args: {
          entity_type_param: string
          entity_id_param: string
          lock_duration_minutes?: number
        }
        Returns: boolean
      }
      check_outlook_connection: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      clean_expired_record_locks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      convert_lead_to_opportunity: {
        Args: {
          lead_id_param: string
        }
        Returns: string
      }
      disconnect_outlook: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_outlook_emails: {
        Args: Record<PropertyKey, never>
        Returns: {
          associated_lead_id: string | null
          body: string
          created_at: string
          has_attachments: boolean
          id: string
          is_enquiry: boolean
          read: boolean
          received_at: string
          sender_email: string
          sender_name: string
          subject: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_record_locked_by_other: {
        Args: {
          entity_type_param: string
          entity_id_param: string
        }
        Returns: Json
      }
      is_senior_management: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      refresh_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      release_record_lock: {
        Args: {
          entity_type_param: string
          entity_id_param: string
        }
        Returns: boolean
      }
      update_opportunity_assessment_status: {
        Args: {
          opportunity_id_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      business_plan_status:
        | "not_requested"
        | "requested"
        | "received"
        | "updates_needed"
        | "approved"
        | "rejected"
      checklist_item_status: "not_started" | "in_progress" | "completed"
      nda_status:
        | "not_issued"
        | "issued"
        | "signed_by_investor"
        | "counter_signed"
        | "completed"
      opportunity_status:
        | "assessment_in_progress"
        | "assessment_completed"
        | "waiting_for_approval"
        | "due_diligence_approved"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
