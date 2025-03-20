import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get active locations only
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
    }
    
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Locations fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
