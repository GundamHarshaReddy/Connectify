import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { session } = await request.json()
    
    // Get cookies store and make sure it's properly awaited
    const cookieStore = cookies()
    
    // Create a Supabase client with the cookie store
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore
    })
    
    // Set the session
    if (session) {
      await supabase.auth.setSession(session)
    }
    
    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    console.error("Error setting session:", error)
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 })
  }
}

