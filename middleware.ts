import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const pathname = req.nextUrl.pathname
    
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired - required for server components
    const { data } = await supabase.auth.getSession()
    const session = data.session
    
    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/profile', '/settings']
    
    // Auth routes that should redirect to dashboard if already logged in
    const authRoutes = ['/auth/login', '/auth/register']
    
    // Special case for the root path - redirect to dashboard if authenticated
    if (pathname === '/' && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // If user is on a protected route and not authenticated
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // If user is authenticated and trying to access auth routes
    if (authRoutes.some(route => pathname.startsWith(route)) && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to proceed to avoid blocking the user
    return NextResponse.next()
  }
}

// Add specific matcher to avoid running on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes that should be accessible without auth
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/public).*)',
  ],
}

