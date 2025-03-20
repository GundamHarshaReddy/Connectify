import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { userId, profile } = await req.json()
    
    if (!userId || !profile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Verify this user exists in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError || !authUser.user) {
      console.error('Error verifying user:', authError)
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }
    
    // Create or update profile in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        updated_at: new Date().toISOString(),
      })
      
    if (profileError) {
      console.error('Error creating profile:', profileError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
