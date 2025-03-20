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
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          created_at?: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          read: boolean
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          read?: boolean
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          read?: boolean
        }
      }
      payments: {
        Row: {
          id: number
          user_id: string
          customer_name: string
          amount: number
          status: string
          payment_date: string
          payment_method: string
        }
        Insert: {
          id?: number
          user_id: string
          customer_name: string
          amount: number
          status: string
          payment_date: string
          payment_method: string
        }
        Update: {
          id?: number
          user_id?: string
          customer_name?: string
          amount?: number
          status?: string
          payment_date?: string
          payment_method?: string
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
