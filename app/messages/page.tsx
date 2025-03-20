"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ConversationList from "@/components/messaging/conversation-list"
import Conversation from "@/components/messaging/conversation"
import { useSupabase } from "@/components/supabase-provider"

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get("id")
  )

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login?returnUrl=/messages')
      }
    }
    
    checkAuth()
  }, [])

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
    router.push(`/messages?id=${conversationId}`, { scroll: false })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        <div className="md:col-span-1">
          <ConversationList 
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation || undefined}
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          {selectedConversation ? (
            <Conversation conversationId={selectedConversation} />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p className="text-muted-foreground">
                  Select a conversation from the list or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

