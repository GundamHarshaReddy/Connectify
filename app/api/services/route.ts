import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPlaceholderImage } from '@/lib/image-utils'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const url = new URL(req.url)
    const category = url.searchParams.get('category')
    const location = url.searchParams.get('location')
    const providerId = url.searchParams.get('providerId')
    
    // Start building the query
    let query = supabase
      .from('services')
      .select(`
        *,
        profiles!services_provider_id_fkey(full_name, email, avatar_url),
        locations(name, city, state, country),
        reviews_aggregate:reviews(rating)
      `)
      .eq('is_active', true)
    
    // Apply filters if provided
    if (category) {
      query = query.eq('category', category)
    }
    
    if (location) {
      query = query.eq('location_id', location)
    }
    
    if (providerId) {
      query = query.eq('provider_id', providerId)
    }
    
    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }
    
    // Process the data to add placeholder images if needed
    const processedData = data.map(service => {
      if (!service.image_url) {
        service.image_url = getPlaceholderImage('service')
      }
      return service
    })
    
    return NextResponse.json(processedData)
  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
