export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ActivityType = 'windsurf' | 'kitesurf' | 'wingfoil' | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          type: ActivityType
          date: string
          details: Json | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: ActivityType
          date?: string
          details?: Json | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: ActivityType
          date?: string
          details?: Json | null
          user_id?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type: ActivityType
    }
  }
}
