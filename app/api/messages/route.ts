import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Get messages between two users
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const otherUserId = searchParams.get("otherUserId")
  
  if (!otherUserId) {
    return NextResponse.json({ error: "Other user ID is required" }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    // Get messages between the current user and the other user
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .order("created_at", { ascending: true })
  
    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }
  
    // Mark unread messages as read
    const unreadMessages = messages?.filter(
      (msg) => msg.receiver_id === user.id && !msg.read
    )
  
    if (unreadMessages && unreadMessages.length > 0) {
      const { error: updateError } = await supabase
        .from("messages")
        .update({ read: true })
        .in(
          "id",
          unreadMessages.map((msg) => msg.id)
        )
  
      if (updateError) {
        console.error("Error marking messages as read:", updateError)
      }
    }
  
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Send a new message
export async function POST(request: NextRequest) {
  try {
    const { receiverId, content } = await request.json()
  
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      )
    }
  
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    // Insert new message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        read: false,
      })
      .select()
      .single()
  
    if (error) {
      console.error("Error sending message:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
  
    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
} 