import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create a new Supabase client
    const supabase = await createClient()

    // First try to get from the categories table
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    if (!error && categories && categories.length > 0) {
      return NextResponse.json({ categories })
    }

    // Fallback: get distinct categories from providers table
    const { data: providerCategories, error: providerError } = await supabase
      .from("providers")
      .select("category")
      .not("category", "is", null)

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
      id: crypto.randomUUID(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      icon: null,
      created_at: new Date().toISOString()
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error("Error in categories API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
} 