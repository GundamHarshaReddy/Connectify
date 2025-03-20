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
      locations: {
        Row: {
          id: number
          created_at: string
          name: string
          city: string
          state: string
          country: string
          latitude: number
          longitude: number
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          city: string
          state: string
          country: string
          latitude: number
          longitude: number
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          city?: string
          state?: string
          country?: string
          latitude?: number
          longitude?: number
          is_active?: boolean
        }
      }
      profiles: {
        Row: {
          id: number
          user_id: string
          created_at: string
          updated_at: string
          full_name: string
          email: string
          phone: string | null
          bio: string | null
          address: string | null
          role: string
          avatar_url: string | null
          location_id: number | null
          verified: boolean
          service_categories: string[] | null
        }
        Insert: {
          id?: number
          user_id: string
          created_at?: string
          updated_at?: string
          full_name: string
          email: string
          phone?: string | null
          bio?: string | null
          address?: string | null
          role: string
          avatar_url?: string | null
          location_id?: number | null
          verified?: boolean
          service_categories?: string[] | null
        }
        Update: {
          id?: number
          user_id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          email?: string
          phone?: string | null
          bio?: string | null
          address?: string | null
          role?: string
          avatar_url?: string | null
          location_id?: number | null
          verified?: boolean
          service_categories?: string[] | null
        }
      }
      services: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          name: string
          description: string
          provider_id: string
          price: number
          duration: number
          category: string
          is_active: boolean
          image_url: string | null
          location_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          name: string
          description: string
          provider_id: string
          price: number
          duration: number
          category: string
          is_active?: boolean
          image_url?: string | null
          location_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          provider_id?: string
          price?: number
          duration?: number
          category?: string
          is_active?: boolean
          image_url?: string | null
          location_id?: number | null
        }
      }
      categories: {
        Row: {
          id: number
          created_at: string
          name: string
          description: string | null
          icon: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          description?: string | null
          icon?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          description?: string | null
          icon?: string | null
        }
      }
    }
  }
}
