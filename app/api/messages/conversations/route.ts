import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Get all conversations for the current user
export async function GET() {
  const supabase = createClient()
  
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    // Get all unique contacts (people the user has exchanged messages with)
    const { data: messageContacts, error: messagesError } = await supabase
      .from("messages")
      .select("sender_id, receiver_id")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    
    if (messagesError) {
      console.error("Error fetching message contacts:", messagesError)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }
  
    // Extract unique user IDs excluding the current user
    const uniqueContactIds = Array.from(
      new Set(
        messageContacts
          .flatMap(msg => [msg.sender_id, msg.receiver_id])
          .filter(id => id !== user.id)
      )
    )
  
    if (uniqueContactIds.length === 0) {
      return NextResponse.json({ conversations: [] })
    }
  
    // Get profile information for each contact
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .in("id", uniqueContactIds)
  
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch contact profiles" }, { status: 500 })
    }
  
    // For each contact, get the latest message
    const conversations = await Promise.all(
      profiles.map(async (profile) => {
        // Get the latest message between the current user and this contact
        const { data: latestMessages, error: latestMessageError } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
          .order("created_at", { ascending: false })
          .limit(1)
  
        if (latestMessageError) {
          console.error("Error fetching latest message:", latestMessageError)
          return null
        }
  
        const latestMessage = latestMessages[0]
  
        // Count unread messages
        const { count: unreadCount, error: countError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("sender_id", profile.id)
          .eq("read", false)
  
        if (countError) {
          console.error("Error counting unread messages:", countError)
          return null
        }
  
        return {
          id: profile.id,
          name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role,
          last_message: latestMessage.content,
          last_message_time: latestMessage.created_at,
          unread: unreadCount || 0
        }
      })
    )
  
    // Filter out null values and sort by latest message
    const validConversations = conversations
      .filter(Boolean)
      .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime())
  
    return NextResponse.json({ conversations: validConversations })
  } catch (error) {
    console.error("Error in conversations API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
} 