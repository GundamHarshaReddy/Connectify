import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(new URL('/auth/login?error=missing_code', request.url))
    }

    // Get the next path or default to dashboard
    const next = requestUrl.searchParams.get('next') || '/dashboard'
    
    // Create a Supabase client with proper cookie handling
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error || !data.session) {
      console.error('Auth exchange error:', error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error?.message || 'Authentication failed')}`, request.url)
      )
    }
    
    // Log successful authentication
    console.log('Successfully authenticated user:', data.session.user.id)
    
    // Redirect to the intended page
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=callback_failed', request.url))
  }
}
