'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/AuthProvider'

export default function DashboardRedirect() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we already have user context from AuthProvider, use that
        if (!isLoading) {
          if (!user) {
            console.log('DashboardRedirect: No user found in context, redirecting to login')
            router.push('/auth/login')
          } else {
            // User is authenticated, we can stay on the dashboard
            setIsLocalLoading(false)
          }
          return
        }
        
        // If AuthProvider is still loading, check session directly
        const supabase = createClientComponentClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('DashboardRedirect: No session found, redirecting to login')
          router.push('/auth/login')
        } else {
          setIsLocalLoading(false)
        }
      } catch (error) {
        console.error('DashboardRedirect error:', error)
        // On error, redirect to login
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [user, isLoading, router])
  
  // Return loading indicator while checking auth
  if (isLocalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Return null when authenticated, letting the page content render
  return null
}
