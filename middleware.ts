import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const pathname = req.nextUrl.pathname
    
    // Skip processing for static assets and API routes
    if (
      pathname.includes('_next') || 
      pathname.includes('static') || 
      pathname.includes('favicon') ||
      pathname.includes('.') // Skip files with extensions
    ) {
      return res
    }
    
    // Allow API routes (except for middleware-protected ones)
    if (pathname.startsWith('/api/') && !pathname.includes('/api/protected/')) {
      return res
    }
    
    // Check for sign-out URL parameter - only allow the login page
    const url = new URL(req.url)
    const isSignedOut = url.searchParams.get('signedOut') === 'true'
    
    // Create a Supabase client
    const supabase = createMiddlewareClient({ req, res })
    
    // Check user session
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error in middleware:', error)
    }
    
    const session = data?.session
    const isAuthenticated = !!session
    
    // Special handling for callback route
    if (pathname === '/auth/callback') {
      return res
    }
    
    // Protected routes that require authentication
    const protectedRoutes = [
      '/dashboard', 
      '/profile', 
      '/settings', 
      '/bookings',
      '/messages',
      '/provider'
    ]
    
    // Auth routes that should redirect to dashboard if already logged in
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
    
    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    // Check if current path is an auth route
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
    
    // If signed out, only allow auth routes
    if (isSignedOut && !isAuthRoute && pathname !== '/') {
      console.log(`Middleware: User is signed out, redirecting from ${pathname} to homepage`)
      return NextResponse.redirect(new URL(`/?signedOut=true&from=${pathname}`, req.url))
    }
    
    // If signed out, only allow auth routes
    if (isSignedOut && !isAuthRoute) {
      console.log(`Middleware: User is signed out, redirecting from ${pathname} to login`)
      return NextResponse.redirect(new URL(`/auth/login?signedOut=true&from=${pathname}`, req.url))
    }
    
    // If user is on a protected route and not authenticated
    if (isProtectedRoute && !isAuthenticated) {
      console.log(`Middleware: Redirecting unauthenticated user from ${pathname} to login`)
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // If user is authenticated and trying to access auth routes
    if (isAuthRoute && isAuthenticated && !isSignedOut) {
      console.log(`Middleware: Redirecting authenticated user from ${pathname} to dashboard`)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login to be safe
    return NextResponse.redirect(new URL('/auth/login?error=middleware_error', req.url))
  }
}

// Configure paths to run middleware on - be more specific with what the middleware protects
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

