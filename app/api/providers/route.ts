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
    
    // First make separate queries to ensure the join works properly
    
    // 1. Query providers
    let providersQuery = supabase
      .from("providers")
      .select("*")
    
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
    
    // Execute the providers query
    const { data: providers, error } = await providersQuery
    
    if (error) {
      console.error("Error fetching providers:", error)
      return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 })
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json({ providers: [] })
    }
    
    console.log(`Found ${providers.length} providers before filtering`)
    
    // 2. Get all relevant profiles in a separate query
    const profileIds = providers.map(p => p.profile_id)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", profileIds)
    
    // Create a map for easier lookup
    const profileMap: Record<string, any> = {}
    if (profiles) {
      profiles.forEach(profile => {
        profileMap[profile.id] = profile
      })
    }
    
    // 3. Get ratings in a separate query
    const providerIds = providers.map(provider => provider.id)
    let ratings: Record<string, number> = {}
    
    if (providerIds.length > 0) {
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("provider_id, rating")
        .in("provider_id", providerIds)
      
      if (reviewsData?.length) {
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
    
    // Helper function to format provider name correctly
    function formatProviderName(profile: any, provider: any) {
      if (profile?.full_name) return profile.full_name;
      if (provider.name && !provider.name.includes(`${provider.category} Provider`)) {
        return provider.name;
      }
      return provider.category || 'Service Provider';
    }
    
    // 4. Process and combine the data
    const processedProviders = providers.map(provider => {
      // Use the profile from our map
      const profile = profileMap[provider.profile_id]
      
      return {
        id: provider.id,
        name: formatProviderName(profile, provider),
        avatar_url: profile?.avatar_url || null,
        category: provider.category || "Unknown",
        description: provider.description || null,
        hourly_rate: provider.hourly_rate || 0,
        location: provider.location || "Unknown",
        rating: ratings[provider.id] || 0,
        profile_id: provider.profile_id,
        // Include raw data for debugging if needed
        _profile: profile || null
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
    return NextResponse.json({ 
      providers: searchResults,
      debug: {
        profilesFound: profiles?.length || 0,
        providersTotal: providers.length
      }
    })
  } catch (error) {
    console.error("Error in providers API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}