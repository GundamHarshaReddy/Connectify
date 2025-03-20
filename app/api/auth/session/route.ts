import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Get session data
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client correctly
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Include detailed user info in the response
    return NextResponse.json({ 
      status: 'success', 
      data: { 
        session,
        authenticated: !!session,
        user: session?.user || null 
      }
    })
  } catch (error) {
    console.error('Session GET error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to get session' },
      { status: 500 }
    )
  }
}

// Handle logging out
export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client correctly
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ status: 'success', message: 'Logged out successfully' })
  } catch (error) {
    console.error('Session DELETE error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to log out' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { session } = await request.json()
    // Get the cookie store directly, not through an intermediate variable
    // which makes TypeScript inference work correctly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const keyPart = supabaseUrl ? supabaseUrl.split('.')[0].split('//')[1] : ''
    
    if (session) {
      
      // Set session cookie
      (await cookies()).set({
        name: `sb-${keyPart}-auth-token`,
        value: JSON.stringify(session),
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
    } else {      
      // Clear session cookie
      (await cookies()).set({
        name: `sb-${keyPart}-auth-token`,
        value: '',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

