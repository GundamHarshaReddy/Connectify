"use client"

import Link from "next/link"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import MainNav from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { useSupabase } from "@/components/supabase-provider"
import { useAuth } from "@/components/AuthProvider"

export default function Header() {
  const { session, isSessionLoading } = useSupabase()
  const { user, signOut } = useAuth()
  
  // Add state to track if signout is in progress
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  const handleSignOut = async () => {
    try {
      // Hide the header immediately to prevent further interaction
      setIsSigningOut(true)
      
      // Call the sign-out function
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
      // Force redirect on error
      window.location.href = `/auth/login?error=sign_out_failed&t=${Date.now()}`
    }
  }
  
  // Don't render the header when signing out or when session is undefined
  if (isSigningOut || !session) {
    return null // Or a simple loading indicator
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <span className="hidden font-bold sm:inline-block">
              Service Platform
            </span>
          </Link>
          <MainNav className="hidden md:flex" />
          <MobileNav />
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
