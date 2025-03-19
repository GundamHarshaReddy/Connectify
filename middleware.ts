import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public and protected paths outside of the middleware function
// so they don't get recreated on every request
const publicPaths = ["/", "/get-started", "/auth/login", "/auth/register", "/auth/forgot-password", "/how-it-works"]

const protectedPaths = [
  "/dashboard",
  "/bookings",
  "/messages",
  "/profile"
]

// API paths should generally be excluded from auth checks to avoid circular dependencies
const apiPaths = ["/api/"]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })
  
  const currentPath = new URL(request.url).pathname
  
  // Skip middleware for API routes to avoid auth-related issues
  if (apiPaths.some(path => currentPath.startsWith(path))) {
    return res
  }
  
  // Refresh session if expired - takes advantage of Supabase's handling
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Check if the path is protected and user is not authenticated
  if (!session && protectedPaths.some(path => currentPath.startsWith(path))) {
    // Create a URL to redirect to login page with the current URL as the redirectedFrom parameter
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', currentPath)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If the user is authenticated and tries to access auth pages, redirect to dashboard
  if (session && currentPath.startsWith("/auth/")) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}

