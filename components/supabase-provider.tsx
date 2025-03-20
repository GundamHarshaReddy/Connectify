'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Session } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
  isSessionLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export default function SupabaseProvider({ 
  children,
  session: initialSession,
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  const [supabase] = useState(() => createClientComponentClient())
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isSessionLoading, setIsSessionLoading] = useState(!initialSession)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      try {
        setIsSessionLoading(true)
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        console.log("Session status:", currentSession ? "authenticated" : "not authenticated")
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setIsSessionLoading(false)
      }
    }
    
    if (!initialSession) {
      getSession()
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Auth state changed: ${event}`)
        
        // Update the session state
        setSession(newSession)
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in, refreshing page')
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to homepage')
          // Clear session state
          setSession(null)
          setIsSessionLoading(false)
          
          // Force full page reload to clear all state and redirect to homepage
          window.location.href = `/?signedOut=true&t=${Date.now()}`
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
        } else if (event === 'USER_UPDATED') {
          console.log('User updated')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, initialSession, router])

  return (
    <SupabaseContext.Provider value={{ supabase, session, isSessionLoading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

