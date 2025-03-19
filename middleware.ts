import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/bookings", "/messages", "/profile", "/providers", "/search/results"]

  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Check if accessing provider detail page
  const isProviderDetailPage = req.nextUrl.pathname.match(/^\/providers\/[^/]+$/)

  if ((isProtectedRoute || isProviderDetailPage) && !session) {
    // Save the original URL the user was trying to access
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search

    // Redirect to login page with a return URL
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("returnUrl", redirectUrl)

    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/providers/:path*",
    "/search/results/:path*",
  ],
}

