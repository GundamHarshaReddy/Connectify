'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user || null)
        router.refresh()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    try {
      setIsLoading(true)
      
      // Clear auth state first
      setUser(null)
      setSession(null)
      
      // Call our custom API endpoint to ensure cookies are properly cleared server-side
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Error response from signout API:', await response.text());
      }
      
      // Then sign out from Supabase client-side
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any stored auth data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        // Clear any other auth-related items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth.')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Force a complete page navigation to the homepage instead of login page
      window.location.href = `/?signedOut=true&t=${Date.now()}`;
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect to homepage even if there was an error
      window.location.href = `/?error=sign_out_failed&t=${Date.now()}`;
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
