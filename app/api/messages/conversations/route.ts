import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Database } from "@/types/supabase"

// Get all conversations for the current user
export async function GET() {
  try {
    // Create Supabase client and await it
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    // Get all conversations the user is part of
    const { data: participations, error: participationsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id)
    
    if (participationsError) {
      console.error("Error fetching conversations:", participationsError)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }
    
    if (!participations || participations.length === 0) {
      return NextResponse.json({ conversations: [] })
    }
    
    const conversationIds = participations.map(p => p.conversation_id)
    
    // Get the other participants in these conversations
    const { data: allParticipants, error: allParticipantsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds)
      .neq("user_id", user.id)
    
    if (allParticipantsError) {
      console.error("Error fetching other participants:", allParticipantsError)
      return NextResponse.json({ error: "Failed to fetch other participants" }, { status: 500 })
    }
    
    // Group other participants by conversation
    const otherParticipantsByConversation = allParticipants.reduce((acc, p) => {
      acc[p.conversation_id] = p.user_id
      return acc
    }, {} as Record<string, string>)
    
    // Get unique other participant IDs
    const otherParticipantIds = Object.values(otherParticipantsByConversation)
    
    // Get profile info for these participants
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .in("id", otherParticipantIds)
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }
    
    // Create a map of profiles by ID
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile
      return acc
    }, {} as Record<string, any>)
    
    // For each conversation, get the latest message
    const conversations = await Promise.all(
      conversationIds.map(async (conversationId) => {
        const otherParticipantId = otherParticipantsByConversation[conversationId]
        const profile = profileMap[otherParticipantId]
        
        if (!profile) {
          return null
        }
        
        // Get latest message
        const { data: latestMessages, error: latestMessageError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
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
          .eq("conversation_id", conversationId)
          .eq("receiver_id", user.id)
          .eq("read", false)
        
        if (countError) {
          console.error("Error counting unread messages:", countError)
        }
  
        return {
          id: conversationId,
          name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role,
          last_message: latestMessage?.content,
          last_message_time: latestMessage?.created_at,
          unreadCount: unreadCount || 0
        }
      })
    )
  
    // Filter out null values and sort by latest message
    const validConversations = conversations
      .filter(Boolean)
      .sort((a, b) => 
        a && b ? new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime() : 0
      )
  
    return NextResponse.json({ conversations: validConversations })
  } catch (error) {
    console.error("Error in conversations API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}