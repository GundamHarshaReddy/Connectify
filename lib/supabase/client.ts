import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  // Check if window is defined (client-side)
  const storage = typeof window !== 'undefined' 
    ? window.localStorage 
    : undefined

  supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: {
        getItem: (key) => {
          if (storage) return storage.getItem(key)
          return null
        },
        setItem: (key, value) => {
          if (storage) storage.setItem(key, value)
        },
        removeItem: (key) => {
          if (storage) storage.removeItem(key)
        },
      }
    }
  })

  return supabaseInstance
}

export const checkEmailConfirmation = async (email: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  return { confirmed: !!data?.id, error }
}

