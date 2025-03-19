import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get("category")
    const query = url.searchParams.get("query")
    const location = url.searchParams.get("location")
    const minRating = parseFloat(url.searchParams.get("minRating") || "0")
    const minPrice = parseFloat(url.searchParams.get("minPrice") || "0")
    const maxPrice = parseFloat(url.searchParams.get("maxPrice") || "1000")
    
    // Create Supabase client
    const supabase = await createClient()
    
    console.log("Fetching providers with params:", { 
      category, 
      query, 
      location,
      minRating, 
      minPrice, 
      maxPrice 
    })
    
    // Build the query
    let providersQuery = supabase
      .from("providers")
      .select(`
        *,
        profiles:profile_id(*)
      `)
    
    // Filter by category if provided
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
    
    // Filter by location if provided
    if (location && location !== "all") {
      providersQuery = providersQuery.ilike("location", `%${location}%`)
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      providersQuery = providersQuery
        .gte("hourly_rate", minPrice)
        .lte("hourly_rate", maxPrice)
    }
    
    // Execute the query
    const { data: providers, error } = await providersQuery
    console.log("Query results:", { 
      count: providers?.length || 0, 
      error: error?.message,
      providers: providers?.slice(0, 2) // Log first 2 providers for debugging
    })

    if (error) {
      console.error("Error fetching providers:", error)
      return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 })
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json({ providers: [] })
    }

    // Get profiles for providers where the join didn't work
    const providersWithoutProfiles = providers.filter(p => !p.profiles).map(p => p.profile_id)
    let profilesMap = {}
    
    if (providersWithoutProfiles.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", providersWithoutProfiles)
      
      if (profiles) {
        profilesMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {})
      }
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
    
    // Process the results - don't filter out providers without profiles
    const processedProviders = providers.map(provider => {
      // Use calculated rating or default to 0
      const rating = ratings[provider.id] || 0
      
      // Get profile data either from the join or from our separate query
      const profile = provider.profiles || profilesMap[provider.profile_id] || {}
      
      return {
        id: provider.id,
        name: profile?.full_name || 'Unknown Provider',
        avatar_url: profile?.avatar_url || null,
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
        (provider.name && provider.name.toLowerCase().includes(searchTerm)) ||
        (provider.category && provider.category.toLowerCase().includes(searchTerm)) ||
        (provider.description && provider.description.toLowerCase().includes(searchTerm)) ||
        (provider.location && provider.location.toLowerCase().includes(searchTerm))
      )
    }

    console.log(`Found ${searchResults.length} providers after filtering`)
    return NextResponse.json({ providers: searchResults })
  } catch (error) {
    console.error("Error in providers API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}