"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProviderOnboarding() {
  const { supabase } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata.role !== 'provider') {
        router.replace('/auth/login')
      }
    }
    checkUser()
  }, [supabase, router])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Provider Onboarding</CardTitle>
          <CardDescription>Complete your profile to start offering services</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add your onboarding form here */}
          <p>Onboarding content coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
