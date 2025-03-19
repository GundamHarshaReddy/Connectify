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
        async get(name) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name, value, options) {
          await cookieStore.set({ name, value, ...options })
        },
        async remove(name, options) {
          await cookieStore.set({ name, value: "", ...options })
        },
      },
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

