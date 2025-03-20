"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Search, 
  CalendarDays, 
  LogOut 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

interface MainNavProps {
  className?: string
}

export default function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { signOut } = useAuth() // Add this line to import signOut function
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      
      if (session?.user) {
        setUserRole(session.user.user_metadata.role || null)
        fetchUnreadMessages()
      }
    }
    
    checkAuth()
    
    // Poll for new messages every minute
    const interval = setInterval(fetchUnreadMessages, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        
        // Calculate total unread
        let totalUnread = 0
        data.conversations?.forEach((conv: any) => {
          totalUnread += conv.unreadCount || 0
        })
        
        setUnreadCount(totalUnread)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }
  
  const handleSignOut = async () => {
    try {
      // Disable any interactions during sign-out
      setIsAuthenticated(false)
      // Use the AuthProvider's signOut function
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
      // If signOut fails, force redirect
      window.location.href = '/auth/login?error=sign_out_failed'
    }
  }
  
  if (!isAuthenticated) return null
  
  // Different nav items based on user role
  const navItems = userRole === 'provider' 
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
        { href: '/provider/dashboard', label: 'Provider Dashboard', icon: <User className="mr-2 h-4 w-4" /> },
        { href: '/messages', label: 'Messages', icon: <MessageSquare className="mr-2 h-4 w-4" />, badge: unreadCount },
        { href: '/bookings', label: 'Bookings', icon: <CalendarDays className="mr-2 h-4 w-4" /> },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
        { href: '/search', label: 'Find Services', icon: <Search className="mr-2 h-4 w-4" /> },
        { href: '/messages', label: 'Messages', icon: <MessageSquare className="mr-2 h-4 w-4" />, badge: unreadCount },
        { href: '/bookings', label: 'My Bookings', icon: <CalendarDays className="mr-2 h-4 w-4" /> },
      ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.icon}
          {item.label}
          {item.badge ? (
            <Badge variant="destructive" className="ml-1">
              {item.badge}
            </Badge>
          ) : null}
        </Link>
      ))}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleSignOut}
        className="ml-auto"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </nav>
  )
}
