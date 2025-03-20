import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get conversations or a specific conversation
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const conversationId = url.searchParams.get("conversationId") 

  try {
    if (conversationId) {
      // Get a specific conversation's messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      if (messagesError) {
        console.error("Error fetching messages:", messagesError)
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
      }
      
      // Mark messages as read
      if (messages && messages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('conversation_id', conversationId)
          .eq('receiver_id', user.id)
          .eq('read', false)
        
        if (updateError) {
          console.error("Error marking messages as read:", updateError)
        }
      }
      
      // Get conversation participants
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
      
      if (participantsError) {
        console.error("Error fetching participants:", participantsError)
        return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
      }
      
      // Get participant profiles
      const participantIds = participants.map(p => p.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', participantIds)
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
      }
      
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {} as Record<string, any>)
      
      return NextResponse.json({
        conversation: {
          id: conversationId,
          messages,
          participants: participantIds.map(id => {
            const isCurrentUser = id === user.id
            return {
              id,
              isCurrentUser,
              ...(!isCurrentUser ? profileMap[id] || {} : {})
            }
          })
        }
      })
    } else {
      // Get all conversations for this user
      const { data: participations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)
      
      if (participationsError) {
        console.error("Error fetching participations:", participationsError)
        return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
      }
      
      const conversationIds = participations.map(p => p.conversation_id)
      
      if (conversationIds.length === 0) {
        return NextResponse.json({ conversations: [] })
      }
      
      // Get all participants for these conversations
      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', conversationIds)
      
      if (allParticipantsError) {
        console.error("Error fetching all participants:", allParticipantsError)
        return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
      }
      
      // Group participants by conversation
      const participantsByConversation = allParticipants.reduce((acc, p) => {
        if (!acc[p.conversation_id]) {
          acc[p.conversation_id] = []
        }
        acc[p.conversation_id].push(p.user_id)
        return acc
      }, {} as Record<string, string[]>)
      
      // Get other participant IDs (excluding current user)
      const otherParticipantIds = new Set<string>()
      Object.values(participantsByConversation).forEach(participants => {
        participants.forEach(id => {
          if (id !== user.id) {
            otherParticipantIds.add(id)
          }
        })
      })
      
      // Get profiles for other participants
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(otherParticipantIds))
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
      }
      
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile
        return acc
      }, {} as Record<string, any>)
      
      // Get latest message for each conversation
      const conversations = await Promise.all(
        conversationIds.map(async (conversationId) => {
          // Get latest message
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
          
          if (messagesError) {
            console.error(`Error fetching messages for conversation ${conversationId}:`, messagesError)
            return null
          }
          
          // Count unread messages
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)
            .eq('receiver_id', user.id)
            .eq('read', false)
          
          if (countError) {
            console.error(`Error counting unread messages for conversation ${conversationId}:`, countError)
          }
          
          const latestMessage = messages[0]
          const participants = participantsByConversation[conversationId] || []
          const otherParticipantId = participants.find(id => id !== user.id)
          const otherParticipant = otherParticipantId ? profileMap[otherParticipantId] : null
          
          return {
            id: conversationId,
            participants: participants.map(id => {
              return id === user.id 
                ? { id, isCurrentUser: true } 
                : { id, isCurrentUser: false, ...profileMap[id] }
            }),
            latestMessage,
            unreadCount: count || 0,
          }
        })
      )
      
      // Filter out nulls and sort by latest message timestamp
      const validConversations = conversations
        .filter(Boolean)
        .sort((a, b) => {
          const timeA = a?.latestMessage?.created_at || '0'
          const timeB = b?.latestMessage?.created_at || '0'
          return new Date(timeB).getTime() - new Date(timeA).getTime()
        })
      
      return NextResponse.json({ conversations: validConversations })
    }
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Create new conversation or send message
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    // Creating a new conversation
    if (body.action === 'create_conversation') {
      if (!body.participantId) {
        return NextResponse.json({ error: "Participant ID is required" }, { status: 400 })
      }
      
      // Check if user exists
      const { data: participant } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', body.participantId)
        .single()
      
      if (!participant) {
        return NextResponse.json({ error: "Participant not found" }, { status: 404 })
      }
      
      // Check if conversation already exists
      const { data: existingParticipations, error: existingError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)
      
      if (existingError) {
        console.error("Error checking existing conversations:", existingError)
        return NextResponse.json({ error: "Failed to check existing conversations" }, { status: 500 })
      }
      
      if (existingParticipations.length > 0) {
        const existingConversationIds = existingParticipations.map(p => p.conversation_id)
        
        const { data: otherParticipations, error: otherError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', body.participantId)
          .in('conversation_id', existingConversationIds)
        
        if (otherError) {
          console.error("Error checking other participations:", otherError)
          return NextResponse.json({ error: "Failed to check other participations" }, { status: 500 })
        }
        
        if (otherParticipations.length > 0) {
          // Conversation already exists
          return NextResponse.json({ conversationId: otherParticipations[0].conversation_id })
        }
      }
      
      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
      
      if (conversationError || !newConversation || newConversation.length === 0) {
        console.error("Error creating conversation:", conversationError)
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
      }
      
      const conversationId = newConversation[0].id
      
      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: body.participantId }
        ])
      
      if (participantsError) {
        console.error("Error adding participants:", participantsError)
        return NextResponse.json({ error: "Failed to add participants" }, { status: 500 })
      }
      
      return NextResponse.json({ conversationId })
    }
    
    // Sending a message
    else if (body.action === 'send_message') {
      if (!body.conversationId || !body.content || !body.receiverId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }
      
      // Verify conversation exists and user is participant
      const { data: participation, error: participationError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('conversation_id', body.conversationId)
        .eq('user_id', user.id)
        .single()
      
      if (participationError || !participation) {
        console.error("Error verifying participation:", participationError)
        return NextResponse.json({ error: "Not authorized to send to this conversation" }, { status: 403 })
      }
      
      // Verify receiver is in this conversation
      const { data: receiverParticipation, error: receiverError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('conversation_id', body.conversationId)
        .eq('user_id', body.receiverId)
        .single()
      
      if (receiverError || !receiverParticipation) {
        console.error("Error verifying receiver participation:", receiverError)
        return NextResponse.json({ error: "Receiver is not in this conversation" }, { status: 403 })
      }
      
      // Add message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: body.conversationId,
          sender_id: user.id,
          receiver_id: body.receiverId,
          content: body.content
        })
        .select()
      
      if (messageError || !message) {
        console.error("Error sending message:", messageError)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
      }
      
      // Update conversation's updated_at timestamp
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', body.conversationId)
      
      if (updateError) {
        console.error("Error updating conversation timestamp:", updateError)
      }
      
      return NextResponse.json({ message: message[0] })
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}