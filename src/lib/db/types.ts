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
      social_connections: {
        Row: {
          id: string
          user_id: string
          platform: 'tiktok' | 'facebook' | 'instagram'
          user_data: Json
          access_token: string | null
          refresh_token: string | null
          connected_at: string
          last_refreshed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'tiktok' | 'facebook' | 'instagram'
          user_data: Json
          access_token?: string | null
          refresh_token?: string | null
          connected_at?: string
          last_refreshed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'tiktok' | 'facebook' | 'instagram'
          user_data?: Json
          access_token?: string | null
          refresh_token?: string | null
          connected_at?: string
          last_refreshed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 