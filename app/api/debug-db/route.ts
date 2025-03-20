import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Look at provider data
    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('*')
    
    // Look at profiles data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    // Get profile IDs from providers
    const providerProfileIds = providers?.map(p => p.profile_id) || []
    
    // Check for matching profiles
    const matchingProfiles = profiles?.filter(p => 
      providerProfileIds.includes(p.id)
    ) || []
    
    // Create better profile entries for providers if needed
    const fixResults = []
    
    for (const provider of providers || []) {
      const hasMatchingProfile = profiles?.some(p => p.id === provider.profile_id)
      
      if (!hasMatchingProfile) {
        // Create a basic profile with the information we have
        const newProfile = {
          id: provider.profile_id,
          full_name: `${provider.category || 'Service'} Provider`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: "provider"
        }
        
        // Insert the profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
        
        fixResults.push({
          provider_id: provider.id,
          action: 'created_profile',
          success: !insertError,
          error: insertError?.message
        })
      }
    }
    
    return NextResponse.json({
      diagnostics: {
        providers: {
          count: providers?.length || 0,
          error: providersError?.message,
          items: providers
        },
        profiles: {
          count: profiles?.length || 0,
          error: profilesError?.message,
          items: profiles
        },
        matching: {
          count: matchingProfiles.length,
          items: matchingProfiles
        },
        fixes: fixResults
      }
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
