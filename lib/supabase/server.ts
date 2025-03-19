import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function createClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
        getAll() {
          return Array.from(cookieStore.getAll()).map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            ...cookie
          }))
        },
        setAll(cookieList: { name: string; value: string; options?: any }[]) {
          try {
            cookieList.forEach(cookie => {
              cookieStore.set({ name: cookie.name, value: cookie.value, ...cookie.options })
            })
          } catch (error) {
            console.error('Error setting cookies:', error)
          }
        }
      }
    }
  )
}

// Use this function when you need to modify specific cookie behavior
export async function createClientWithCustomCookies() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          try {
            return cookies().get(name)?.value
          } catch {
            return undefined
          }
        },
        async set(name, value, options) {
          try {
            cookies().set({ name, value, ...options })
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        async remove(name, options) {
          try {
            cookies().set({ name, value: "", ...options })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        }
      }
    }
  )
}

// Alternative implementation for server components that need to await cookies
export async function createClientForServerComponent() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          try {
            const cookie = await cookieStore.get(name)
            return cookie?.value
          } catch {
            return undefined
          }
        },
        async set(name, value, options) {
          try {
            await cookieStore.set({ name, value, ...options })
          } catch {
            // Handle errors
          }
        },
        async remove(name, options) {
          try {
            await cookieStore.set({ name, value: "", ...options })
          } catch {
            // Handle errors
          }
        }
      }
    }
  )
}

