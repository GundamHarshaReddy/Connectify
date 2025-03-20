import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { calculateDistance } from "@/lib/utils/geo"

const PROXIMITY_THRESHOLD = 10 // kilometers

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get("lat") || "0")
  const lng = parseFloat(searchParams.get("lng") || "0")
  
  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all users with location data
    const { data: users, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        role,
        latitude,
        longitude
      `)
      .not("id", "eq", user.id) // Exclude current user
      .not("latitude", "is", null)
      .not("longitude", "is", null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter users by proximity
    const nearbyUsers = users.filter(u => {
      if (!u.latitude || !u.longitude) return false
      const distance = calculateDistance(lat, lng, u.latitude, u.longitude)
      return distance <= PROXIMITY_THRESHOLD
    })

    return NextResponse.json({ users: nearbyUsers })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch nearby users" },
      { status: 500 }
    )
  }
}
