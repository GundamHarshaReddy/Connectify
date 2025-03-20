"use client"

import { useState, useEffect, useRef } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ConversationProps {
  conversationId: string
}

export default function Conversation({ conversationId }: ConversationProps) {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversation, setConversation] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherParticipant, setOtherParticipant] = useState<any>({
    id: "",
    full_name: "Loading...",
    avatar_url: ""
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversation data when the ID changes
  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      
      // Set up polling for new messages
      const interval = setInterval(fetchConversation, 5000)
      return () => clearInterval(interval)
    }
  }, [conversationId])

  useEffect(() => {
    // Get current user info
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setCurrentUser({ ...data, id: user.id })
      }
    }

    fetchCurrentUser()
  }, [])

  // Add a new effect to fetch participant profile
  useEffect(() => {
    const fetchParticipantProfile = async () => {
      if (conversation && currentUser) {
        const otherParticipantId = conversation.participants.find(
          (id: string) => id !== currentUser.id
        )
        
        if (otherParticipantId) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', otherParticipantId)
            .single()
            
          if (data) {
            setOtherParticipant(data)
          }
        }
      }
    }
    
    fetchParticipantProfile()
  }, [conversation, currentUser])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const fetchConversation = async () => {
    if (!conversationId) return
    
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      
      if (response.ok) {
        const data = await response.json()
        setConversation(data.conversation)
      }
    } catch (error) {
      console.error("Error fetching conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !conversationId || !currentUser) return
    
    setSending(true)
    
    try {
      const receiverId = conversation.participants.find(
        (id: string) => id !== currentUser.id
      )
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          conversationId,
          receiverId,
          content: message
        })
      })
      
      if (response.ok) {
        setMessage("")
        await fetchConversation()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (!conversationId) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <p className="text-muted-foreground">
              Select a conversation or start a new one
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-20 w-2/3 rounded-md" />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <div className="w-full flex space-x-2">
            <Skeleton className="h-10 flex-grow rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </CardFooter>
      </Card>
    )
  }

  if (!conversation) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardContent className="flex items-center justify-center flex-grow">
          <div className="text-center">
            <p className="text-muted-foreground">
              Conversation not found
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={otherParticipant.avatar_url} />
            <AvatarFallback>
              {otherParticipant.full_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span>{otherParticipant.full_name}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto p-4">
        <div className="space-y-4">
          {conversation.messages.map((msg: any) => {
            const isSentByCurrentUser = msg.senderId === currentUser?.id
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isSentByCurrentUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    isSentByCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <form 
          className="w-full flex space-x-2"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button type="submit" disabled={!message.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
