import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a new Supabase client
    const supabase = await createClient()
    console.log("Fetching categories...")

    // First try to get from the categories table
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    console.log("Categories query result:", { 
      count: categories?.length || 0, 
      error: error?.message 
    })

    if (!error && categories && categories.length > 0) {
      console.log(`Found ${categories.length} categories in categories table`)
      return NextResponse.json({ categories })
    }

    // Fallback: get distinct categories from providers table
    const { data: providerCategories, error: providerError } = await supabase
      .from("providers")
      .select("category")
      .not("category", "is", null)

    console.log("Provider categories query result:", { 
      count: providerCategories?.length || 0, 
      error: providerError?.message 
    })

    if (providerError) {
      console.error("Error fetching categories:", providerError)
      return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    // Extract unique categories
    const uniqueCategories = [...new Set(providerCategories.map(p => p.category))]
      .filter(Boolean)
      .sort()

    // Format for response (for compatibility with categories table format)
    const formattedCategories = uniqueCategories.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      icon: null,
      created_at: new Date().toISOString()
    }))

    console.log(`Found ${formattedCategories.length} unique categories from providers table`)
    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error("Error in categories API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}