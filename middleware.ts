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
  "/profile",
  "/providers",
  "/search",
]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const currentPath = request.nextUrl.pathname
  
  // Check if current path is a protected path or starts with one
  const isProtectedPath = protectedPaths.some(path => 
    currentPath === path || currentPath.startsWith(`${path}/`)
  )
  
  const isPublicPath = publicPaths.some(path => 
    currentPath === path || currentPath.startsWith(`${path}/`)
  )

  // If user is not signed in and trying to access a protected route
  if (!session && isProtectedPath) {
    // Create the URL with the redirect information
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access auth pages
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

