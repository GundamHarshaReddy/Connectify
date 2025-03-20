'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient, type Session } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  session: Session | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({ 
  children,
  session: initialSession,
}: { 
  children: React.ReactNode
  session: Session | null
}) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <Context.Provider value={{ supabase, session }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}

