import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    const { session } = await request.json()
  
    if (session) {
      await supabase.auth.setSession(session)
    }
  
    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    console.error("Error setting session:", error)
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 })
  }
}

