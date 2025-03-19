import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get("category")
  const query = searchParams.get("query")
  const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : 0
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 1000

  try {
    // Create a new Supabase client with the updated function
    const supabase = await createClient()
    
    // Start building the query
    let providersQuery = supabase
      .from("providers")
      .select(`
        id,
        profile_id,
        category,
        description,
        hourly_rate,
        location,
        availability,
        profiles:profile_id (
          id,
          full_name,
          avatar_url
        )
      `)
    
    // Apply filters
    if (category && category !== "all") {
      // First get the proper category name from the categories table if using slug
      if (category.includes('-')) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("name")
          .ilike("name", category.replace(/-/g, ' '))
          .single()
        
        if (categoryData) {
          providersQuery = providersQuery.eq("category", categoryData.name)
        }
      } else {
        providersQuery = providersQuery.eq("category", category)
      }
    }
    
    if (minPrice || maxPrice) {
      providersQuery = providersQuery
        .gte("hourly_rate", minPrice)
        .lte("hourly_rate", maxPrice)
    }
    
    // Execute the query
    const { data: providers, error } = await providersQuery

    if (error) {
      console.error("Error fetching providers:", error)
      return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 })
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json({ providers: [] })
    }

    // Get ratings in a separate query
    const providerIds = providers.map(provider => provider.id)
    let ratings: Record<string, number> = {}
    
    if (providerIds.length > 0) {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("provider_id, rating")
        .in("provider_id", providerIds)
      
      if (!reviewsError && reviewsData) {
        // Calculate average ratings
        const ratingsByProvider: Record<string, number[]> = {}
        
        reviewsData.forEach(review => {
          if (!ratingsByProvider[review.provider_id]) {
            ratingsByProvider[review.provider_id] = []
          }
          ratingsByProvider[review.provider_id].push(review.rating)
        })
        
        // Calculate average for each provider
        Object.keys(ratingsByProvider).forEach(providerId => {
          const providerRatings = ratingsByProvider[providerId]
          const avgRating = providerRatings.reduce((sum, r) => sum + r, 0) / providerRatings.length
          ratings[providerId] = parseFloat(avgRating.toFixed(1))
        })
      }
    }
    
    // Process and filter the results
    const processedProviders = providers
      .filter(provider => provider.profiles) // Filter out providers without profiles
      .map(provider => {
        // Use calculated rating or default to 0
        const rating = ratings[provider.id] || 0
        
        return {
          id: provider.id,
          name: provider.profiles?.full_name || 'Unknown Provider',
          avatar_url: provider.profiles?.avatar_url || null,
          category: provider.category,
          description: provider.description,
          hourly_rate: provider.hourly_rate,
          location: provider.location,
          rating: rating,
          profile_id: provider.profile_id
        }
      })
    
    // Filter by minimum rating
    const filteredProviders = processedProviders.filter(provider => provider.rating >= minRating)
    
    // Filter by search query if provided
    let searchResults = filteredProviders
    if (query) {
      const searchTerm = query.toLowerCase()
      searchResults = filteredProviders.filter(provider => 
        provider.name.toLowerCase().includes(searchTerm) ||
        provider.category.toLowerCase().includes(searchTerm) ||
        provider.description?.toLowerCase().includes(searchTerm) ||
        provider.location?.toLowerCase().includes(searchTerm)
      )
    }

    return NextResponse.json({ providers: searchResults })
  } catch (error) {
    console.error("Error in providers API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
} 