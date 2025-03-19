import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables')
}

// Cache for cookie values to avoid repeated async calls
let cookieCache: Record<string, string> = {}

/**
 * Create a Supabase client for server components
 * This approach directly uses cookies() and should only be used in Server Components
 * or Route Handlers where you can properly await the result
 */
export async function createClient() {
  const cookieStore = await cookies()
  
  // Pre-load all cookies into a cache to avoid multiple async calls
  const allCookies = cookieStore.getAll()
  cookieCache = {}
  
  for (const cookie of allCookies) {
    cookieCache[cookie.name] = cookie.value
  }
  
  return createSupabaseClient<Database>(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      auth: {
        persistSession: true,
        // Use our custom cookie handler
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key) => {
            return cookieCache[key]
          },
          setItem: (key, value) => {
            cookieCache[key] = value
            cookieStore.set({ 
              name: key, 
              value, 
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 1 week
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            })
          },
          removeItem: (key) => {
            delete cookieCache[key]
            cookieStore.set({ 
              name: key, 
              value: '', 
              path: '/',
              maxAge: 0,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            })
          }
        }
      }
    }
  )
}

/**
 * For API routes that use cookies from a Request object
 */
export function createRouteHandlerClient(request: Request) {
  const requestHeaders = new Headers(request.headers)
  const cookieString = requestHeaders.get('cookie') || ''
  
  // Parse cookies from string
  const parsedCookies: Record<string, string> = {}
  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      parsedCookies[name] = rest.join('=')
    }
  })
  
  return createSupabaseClient<Database>(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      auth: {
        persistSession: true,
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key) => {
            return parsedCookies[key]
          },
          setItem: (key, value) => {
            parsedCookies[key] = value
            // Note: The caller is responsible for setting cookies in the response
          },
          removeItem: (key) => {
            delete parsedCookies[key]
            // Note: The caller is responsible for removing cookies in the response
          }
        }
      }
    }
  )
}

/**
 * Dedicated client for middleware
 */
export function createMiddlewareClient(req: Request, res: Response) {
  const requestHeaders = new Headers(req.headers)
  const cookieString = requestHeaders.get('cookie') || ''
  
  // Parse cookies from string
  const parsedCookies: Record<string, string> = {}
  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      parsedCookies[name] = rest.join('=')
    }
  })
  
  return createSupabaseClient<Database>(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      auth: {
        persistSession: true,
        storageKey: 'sb-auth-token',
        storage: {
          getItem: (key) => {
            return parsedCookies[key]
          },
          setItem: (key, value) => {
            parsedCookies[key] = value
            // Note: The caller should set cookies on the response
          },
          removeItem: (key) => {
            delete parsedCookies[key]
            // Note: The caller should handle removing cookies
          }
        }
      }
    }
  )
}