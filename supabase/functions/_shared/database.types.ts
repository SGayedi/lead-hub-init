
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          status: string
          priority: string
          source: string
          inquiry_type: string
          description: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          assigned_to: string | null
          assigned_by: string
          status: string
          priority: string
          due_date: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          created_at: string
          updated_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: string
          is_read: boolean
          related_entity_id: string | null
          related_entity_type: string | null
          created_at: string
        }
      }
      meetings: {
        Row: {
          id: string
          title: string
          description: string | null
          meeting_type: string
          start_time: string
          end_time: string
          location: string | null
          lead_id: string | null
          created_by: string
          outcome: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
