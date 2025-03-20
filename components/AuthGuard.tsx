"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { Loader2 } from 'lucide-react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isSessionLoading, supabase } = useSupabase()
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Double-check authentication status
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error checking session:', error)
          window.location.href = '/auth/login?error=session_error'
          return
        }
        
        if (!data.session) {
          console.log('AuthGuard: No session found, redirecting to login')
          window.location.href = '/auth/login?redirectedFrom=' + encodeURIComponent(window.location.pathname)
          return
        }
        
        // User is authenticated, allow access to the page
        setIsCheckingAuth(false)
      } catch (error) {
        console.error('Auth check error:', error)
        window.location.href = '/auth/login?error=auth_check_error'
      }
    }

    // Always check auth, even if session appears to exist in context
    checkAuth()
    
    // Also set up a listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _) => {
      if (event === 'SIGNED_OUT') {
        // Redirect immediately on sign out to homepage instead of login
        window.location.href = `/?signedOut=true&t=${Date.now()}`
      }
    })
    
    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Show loading state while checking authentication
  if (isSessionLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying authentication...</span>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}
