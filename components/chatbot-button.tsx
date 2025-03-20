"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MessageSquare, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "ai/react"
import { useSupabase } from "@/components/supabase-provider"

export default function ChatbotButton() {
  const [open, setOpen] = useState(false)
  const { supabase } = useSupabase()
  const [userRole, setUserRole] = useState<'customer' | 'provider' | null>(null)

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role)
      }
    }
    getUserRole()
  }, [supabase])

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chatbot",
    initialMessages: [
      {
        id: "welcome",
        role: "system",
        content: userRole === 'provider' 
          ? "Welcome to Connectify! I can help you manage your services, bookings, and provider settings. What do you need help with?"
          : "Welcome to Connectify! I can help you find and book services. What are you looking for?",
      }
    ],
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">Open chatbot</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-[90vh]">
          <SheetHeader className="border-b p-4">
            <SheetTitle>
              <span className="text-xl font-bold">
                Connectify
                <span className="text-primary">.</span>
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Welcome to <span className="text-primary font-bold">Connectify</span></h3>
                <p className="text-sm">
                  How can I assist you today with finding or managing services?
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      {message.role === "user" ? (
                        <AvatarFallback>U</AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                          <AvatarFallback>AI</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t p-4">
            <form onSubmit={onSubmit} className="flex gap-2">
              <Input placeholder="Type your message..." value={input} onChange={handleInputChange} className="flex-1" />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

