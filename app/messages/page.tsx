"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Phone, Video, Info } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type Contact = {
  id: string
  name: string
  avatar_url: string | null
  role: string
  last_message: string
  last_message_time: string
  unread: number
}

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Get current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data.user?.id || null)
    }
    fetchCurrentUser()
  }, [supabase])

  // Fetch contacts/conversations
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/messages/conversations")
        
        if (!response.ok) {
          throw new Error("Failed to fetch conversations")
        }
        
        const data = await response.json()
        setContacts(data.conversations || [])

        // If provider ID is in URL, select that contact
        const providerId = searchParams.get("provider")
        if (providerId) {
          const contact = data.conversations.find((c: Contact) => c.id === providerId)
          if (contact) {
            setSelectedContact(contact)
          }
        } else if (data.conversations && data.conversations.length > 0) {
          // Otherwise select first contact
          setSelectedContact(data.conversations[0])
        }
      } catch (error) {
        console.error("Error fetching contacts:", error)
        toast({
          title: "Failed to load conversations",
          description: "Please try refreshing the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUserId) {
      fetchContacts()
    }
  }, [searchParams, toast, currentUserId])

  // Fetch messages for selected contact
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedContact && currentUserId) {
        try {
          const response = await fetch(`/api/messages?otherUserId=${selectedContact.id}`)
          
          if (!response.ok) {
            throw new Error("Failed to fetch messages")
          }
          
          const data = await response.json()
          setMessages(data.messages || [])
          scrollToBottom()
          
          // Update the unread count for this contact
          setContacts(prev => 
            prev.map(contact => 
              contact.id === selectedContact.id 
                ? { ...contact, unread: 0 } 
                : contact
            )
          )
        } catch (error) {
          console.error("Error fetching messages:", error)
          toast({
            title: "Failed to load messages",
            description: "Please try refreshing the page.",
            variant: "destructive",
          })
        }
      }
    }

    fetchMessages()
  }, [selectedContact, toast, currentUserId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedContact || !currentUserId) return

    setSendingMessage(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()
      
      // Optimistically add the message to the UI
      const newMsg: Message = {
        id: data.message.id,
        sender_id: currentUserId,
        receiver_id: selectedContact.id,
        content: newMessage,
        created_at: new Date().toISOString(),
        read: false,
      }

      setMessages(prev => [...prev, newMsg])
      setNewMessage("")
      scrollToBottom()
      
      // Update the last message in contacts list
      setContacts(prev => 
        prev.map(contact => 
          contact.id === selectedContact.id 
            ? { 
                ...contact, 
                last_message: newMessage,
                last_message_time: new Date().toISOString()
              } 
            : contact
        )
      )
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  // Setup real-time updates
  useEffect(() => {
    if (!supabase || !currentUserId) return
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload) => {
          // A new message has been received
          const newMessage = payload.new as Message
          
          // If the message is from the currently selected contact, add it to the messages
          if (selectedContact && newMessage.sender_id === selectedContact.id) {
            setMessages(prev => [...prev, newMessage])
            scrollToBottom()
            
            // Mark it as read
            await fetch(`/api/messages?otherUserId=${selectedContact.id}`)
          }
          
          // Update the contacts list to show the new message
          const senderContact = contacts.find(c => c.id === newMessage.sender_id)
          
          if (senderContact) {
            // Update existing contact
            setContacts(prev => 
              prev.map(contact => 
                contact.id === newMessage.sender_id 
                  ? { 
                      ...contact, 
                      last_message: newMessage.content,
                      last_message_time: newMessage.created_at,
                      unread: selectedContact?.id === newMessage.sender_id 
                        ? 0 // If we're viewing this contact, mark as read
                        : contact.unread + 1 // Otherwise increment unread count
                    } 
                  : contact
              ).sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime())
            )
          } else {
            // Fetch updated conversations list
            const response = await fetch("/api/messages/conversations")
            if (response.ok) {
              const data = await response.json()
              setContacts(data.conversations || [])
            }
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, currentUserId, selectedContact, contacts])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-10rem)]">
        {/* Contacts List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="text-xl font-bold">Messages</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="p-2">
              {loading ? (
                <div className="space-y-4 p-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
                        selectedContact?.id === contact.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar_url} alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {contact.unread > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">{contact.name}</h3>
                          <span className="text-xs text-muted-foreground">{formatDate(contact.last_message_time)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.last_message}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 lg:col-span-3 border rounded-lg overflow-hidden flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-muted/50">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar_url} alt={selectedContact.name} />
                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedContact.name}</h3>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === "current_user"
                    const showDate =
                      index === 0 || formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)

                    return (
                      <div key={message.id} className="space-y-4">
                        {showDate && (
                          <div className="flex justify-center">
                            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`flex items-end gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : ""}`}
                          >
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedContact.avatar_url} alt={selectedContact.name} />
                                <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              <p>{message.content}</p>
                              <span className="text-xs opacity-70 block text-right mt-1">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a contact to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

