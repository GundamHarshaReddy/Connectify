"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { 
  LayoutDashboard, 
  MessageSquare, 
  User, 
  Search, 
  CalendarDays, 
  LogOut 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { signOut } = useAuth() // Add this line to import signOut function
  const [isOpen, setIsOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [userRole, setUserRole] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      
      if (session?.user) {
        setUserRole(session.user.user_metadata.role || null)
        fetchUnreadMessages()
      }
    }
    
    checkAuth()
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
      setIsOpen(false) // Close the mobile menu first
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-bold">Service Platform</span>
          </Link>
        </div>
        <div className="flex flex-col space-y-3 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center px-7 py-2 text-base font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "bg-muted text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.label}
              {item.badge ? (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="flex items-center px-7 py-2 justify-start font-medium"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
