import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Supabase signout error:', error)
    }
    
    // Clear all auth-related cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const keyPart = supabaseUrl.split('.')[0].split('//')[1]
      
      // Delete standard cookie format
      cookieStore.delete(`sb-${keyPart}-auth-token`)
      
      // Delete with path specified
      cookieStore.delete({
        name: `sb-${keyPart}-auth-token`,
        path: '/',
      })
      
      // Clear with options that match how the cookie was set
      cookieStore.set({
        name: `sb-${keyPart}-auth-token`,
        value: '',
        path: '/',
        maxAge: 0, // Expire immediately
        expires: new Date(0), // Expire immediately
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      })
      
      // Clear any other Supabase-related cookies
      Array.from(cookieStore.getAll()).forEach(cookie => {
        if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
          cookieStore.delete(cookie.name)
        }
      });
    }
    
    // Return success response with no-cache headers
    const response = NextResponse.json(
      { success: true, message: 'Successfully signed out' },
      { status: 200 }
    )
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to sign out' },
      { status: 500 }
    )
  }
}

// Also handle GET requests to support direct navigation
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear cookies (same as in POST)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const keyPart = supabaseUrl.split('.')[0].split('//')[1]
      cookieStore.delete(`sb-${keyPart}-auth-token`)
      cookieStore.delete({
        name: `sb-${keyPart}-auth-token`,
        path: '/',
      })
    }
    
    // Redirect to the homepage with cache busting instead of login page
    return NextResponse.redirect(new URL(`/?signedOut=true&t=${Date.now()}`, request.url))
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.redirect(new URL(`/?error=sign_out_failed&t=${Date.now()}`, request.url))
  }
}
