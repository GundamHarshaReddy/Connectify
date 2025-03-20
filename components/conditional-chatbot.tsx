'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import ChatbotButton from '@/components/chatbot-button'

const publicPaths = ['/', '/auth/login', '/auth/register', '/get-started', '/how-it-works']

export default function ConditionalChatbot() {
  const { supabase } = useSupabase()
  const pathname = usePathname()
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      // Show chat if user is authenticated and not on a public path
      setShowChat(!!session && !publicPaths.some(path => pathname === path))
    }

    checkAuth()
  }, [supabase, pathname])

  if (!showChat) return null

  return <ChatbotButton />
}
