'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const supabase = createClientComponentClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // User is authenticated, redirect to dashboard or the original URL they were trying to access
          const destination = redirectedFrom || '/dashboard'
          console.log('AuthRedirect: User is authenticated, redirecting to', destination)
          router.push(destination)
        } else {
          // Just mark as not loading if we're not redirecting
          console.log('AuthRedirect: User is not authenticated, staying on current page')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('AuthRedirect checkAuth error:', error)
        setIsLoading(false)
      }
    }
    
    // Only run on auth pages
    if (pathname.startsWith('/auth/')) {
      checkAuth()
    } else {
      setIsLoading(false)
    }
  }, [pathname, redirectedFrom, router])
  
  // Display a minimal loading indicator if we're actively redirecting
  return isLoading ? <div className="fixed inset-0 flex items-center justify-center bg-background/50 z-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div> : null
}
