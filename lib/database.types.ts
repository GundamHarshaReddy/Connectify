export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string | null
          avatar_url: string | null
          role: "customer" | "provider"
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          email?: string | null
          avatar_url?: string | null
          role: "customer" | "provider"
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string | null
          avatar_url?: string | null
          role?: "customer" | "provider"
          latitude?: number | null
          longitude?: number | null
        }
      }
      providers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          profile_id: string
          category: string
          description: string | null
          hourly_rate: number | null
          location: string | null
          availability: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id: string
          category: string
          description?: string | null
          hourly_rate?: number | null
          location?: string | null
          availability?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id?: string
          category?: string
          description?: string | null
          hourly_rate?: number | null
          location?: string | null
          availability?: Json | null
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          icon: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          icon?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          icon?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          customer_id: string
          provider_id: string
          service_date: string
          start_time: string
          end_time: string
          status: "pending" | "confirmed" | "completed" | "cancelled"
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id: string
          provider_id: string
          service_date: string
          start_time: string
          end_time: string
          status?: "pending" | "confirmed" | "completed" | "cancelled"
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id?: string
          provider_id?: string
          service_date?: string
          start_time?: string
          end_time?: string
          status?: "pending" | "confirmed" | "completed" | "cancelled"
          notes?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          booking_id: string
          customer_id: string
          provider_id: string
          rating: number
          comment: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id: string
          customer_id: string
          provider_id: string
          rating: number
          comment?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id?: string
          customer_id?: string
          provider_id?: string
          rating?: number
          comment?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
        }
      }
    }
    Views: {
      service_categories: {
        Row: {
          name: string | null
          description: string | null
          icon: string | null
        }
      }
    }
    Functions: {
      get_provider_rating: {
        Args: {
          provider_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

