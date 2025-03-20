import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getCategoryIconUrl } from '@/lib/image-utils'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
    
    // Add full icon URLs where applicable
    const categoriesWithIcons = categories.map(category => ({
      ...category,
      icon: category.icon ? getCategoryIconUrl(category.icon) : null,
    }))
    
    return NextResponse.json(categoriesWithIcons)
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
