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
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      points: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          amount?: number
          type?: string
          description?: string | null
          metadata?: Json | null
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          description: string | null
          points: number
          unlocked_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          description?: string | null
          points?: number
          unlocked_at?: string
          metadata?: Json | null
        }
        Update: {
          type?: string
          name?: string
          description?: string | null
          points?: number
          metadata?: Json | null
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string | null
          description: string | null
          date: string
          location: string | null
          details: Json | null
          points_earned: number
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title?: string | null
          description?: string | null
          date?: string
          location?: string | null
          details?: Json | null
          points_earned?: number
          metadata?: Json | null
        }
        Update: {
          type?: string
          title?: string | null
          description?: string | null
          date?: string
          location?: string | null
          details?: Json | null
          points_earned?: number
          metadata?: Json | null
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          current_count: number
          longest_count: number
          last_activity_date: string
          started_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          current_count?: number
          longest_count?: number
          last_activity_date?: string
          started_at?: string
          metadata?: Json | null
        }
        Update: {
          current_count?: number
          longest_count?: number
          last_activity_date?: string
          metadata?: Json | null
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          points_reward: number
          start_date: string | null
          end_date: string | null
          requirements: Json
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          points_reward?: number
          start_date?: string | null
          end_date?: string | null
          requirements: Json
          metadata?: Json | null
        }
        Update: {
          title?: string
          description?: string | null
          type?: string
          points_reward?: number
          start_date?: string | null
          end_date?: string | null
          requirements?: Json
          metadata?: Json | null
        }
      }
      user_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          progress: number
          completed: boolean
          completed_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          metadata?: Json | null
        }
        Update: {
          progress?: number
          completed?: boolean
          completed_at?: string | null
          metadata?: Json | null
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
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
