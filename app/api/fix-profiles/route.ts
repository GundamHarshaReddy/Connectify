import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all providers that need profile fixing
    const { data: providers, error } = await supabase
      .from("providers")
      .select("*")
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`Found ${providers?.length || 0} providers total`);
    
    // For each provider, check if profile exists and fix if needed
    const results = await Promise.all(providers.map(async (provider) => {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", provider.profile_id)
        .single()
      
      console.log(`Provider ${provider.id}: profile_id=${provider.profile_id}, has profile: ${!!profile}`);
      
      // If profile doesn't exist, we need to create one
      if (!profile) {
        // First try to get user info from auth.users
        let userName = `${provider.category} Provider`;
        let userEmail = null;
        
        try {
          // This query might fail if we don't have access to auth.users
          const { data: userData } = await supabase.auth.admin.getUserById(provider.profile_id);
          if (userData?.user) {
            userEmail = userData.user.email;
            userName = userData.user.user_metadata?.full_name || 
                      userData.user.email?.split('@')[0] || 
                      userName;
            console.log(`Found user data for ${provider.profile_id}: ${userName}`);
          }
        } catch (e) {
          console.log("Couldn't access auth.users:", e);
        }
        
        // Create new profile
        const newProfile = {
          id: provider.profile_id,
          full_name: userName,
          email: userEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: "provider",
          avatar_url: null
        };
        
        console.log(`Creating new profile:`, newProfile);
        
        // Insert the profile
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile)
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          return {
            provider_id: provider.id,
            profile_id: provider.profile_id,
            created: false,
            error: insertError.message
          }
        }
        
        // Now update the provider entry to include more information
        const { error: updateError } = await supabase
          .from("providers")
          .update({
            updated_at: new Date().toISOString()
          })
          .eq("id", provider.id)
        
        return {
          provider_id: provider.id,
          profile_id: provider.profile_id,
          created: true,
          name: userName,
          updated: !updateError
        }
      }
      
      // Profile exists, just return info
      return {
        provider_id: provider.id,
        profile_id: provider.profile_id,
        exists: true,
        name: profile.full_name
      }
    }))
    
    return NextResponse.json({ 
      totalProviders: providers?.length || 0,
      profilesCreated: results.filter(r => r.created).length,
      profilesExisting: results.filter(r => r.exists).length,
      results 
    })
  } catch (error) {
    console.error("Error fixing profiles:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
