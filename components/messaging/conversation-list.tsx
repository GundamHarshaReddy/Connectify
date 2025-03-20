"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { MessageSquare, Search, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ConversationListProps {
  onSelectConversation: (id: string) => void
  selectedConversationId?: string
}

export default function ConversationList({ 
  onSelectConversation,
  selectedConversationId 
}: ConversationListProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [potentialRecipients, setPotentialRecipients] = useState<any[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setPotentialRecipients([])
      return
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${query}%`)
        .limit(5)

      setPotentialRecipients(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const createConversation = async () => {
    if (!selectedRecipient) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_conversation',
          participantId: selectedRecipient
        })
      })

      if (response.ok) {
        const { conversationId } = await response.json()
        
        // Refresh conversations list
        await fetchConversations()
        
        // Select the new conversation
        onSelectConversation(conversationId)
        
        // Reset UI
        setShowNewMessage(false)
        setSelectedRecipient("")
        setPotentialRecipients([])
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => !p.isCurrentUser)
  }

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv)
    return otherParticipant && 
      otherParticipant.full_name && 
      otherParticipant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Messages</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowNewMessage(!showNewMessage)}
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </CardTitle>
        <CardDescription>Recent conversations</CardDescription>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showNewMessage && (
          <div className="space-y-2 mt-4 p-3 bg-muted rounded-md">
            <Select 
              value={selectedRecipient} 
              onValueChange={setSelectedRecipient}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {potentialRecipients.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Search for a user..."
              onChange={(e) => searchUsers(e.target.value)}
            />
            
            <div className="flex justify-end">
              <Button 
                disabled={!selectedRecipient} 
                onClick={createConversation}
              >
                Start conversation
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow overflow-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map(conversation => {
              const otherParticipant = getOtherParticipant(conversation)
              const lastMessage = conversation.messages[conversation.messages.length - 1]
              
              return (
                <div
                  key={conversation.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted ${
                    selectedConversationId === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <Avatar>
                    <AvatarImage src={otherParticipant?.avatar_url || ""} />
                    <AvatarFallback>
                      {otherParticipant?.full_name?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">
                        {otherParticipant?.full_name || "Unknown User"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p>No conversations found</p>
            <Button 
              variant="link" 
              onClick={() => setShowNewMessage(true)}
            >
              Start a new conversation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
