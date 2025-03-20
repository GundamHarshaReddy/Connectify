import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { session } = await request.json()
  const cookieStore = await cookies()

  try {
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) })

    if (session) {
      // Set auth cookie
      cookieStore.set('sb-auth-token', JSON.stringify(session), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })

      // Also update Supabase session
      await supabase.auth.setSession(session)
    } else {
      cookieStore.delete('sb-auth-token')
      await supabase.auth.signOut()
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Session management error:', error)
    return NextResponse.json(
      { error: 'Failed to manage session' },
      { status: 500 }
    )
  }
}
