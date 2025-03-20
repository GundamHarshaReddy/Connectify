import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"

interface UserProfileAvatarProps {
  user: User | null
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserProfileAvatar({ user, size = "md", className = "" }: UserProfileAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState("?")
  const { supabase } = useSupabase()
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  }
  
  useEffect(() => {
    const getInitials = () => {
      if (!user) return "?"
      
      // Try to get full name from metadata
      const fullName = user.user_metadata?.full_name || ""
      if (fullName) {
        const nameParts = fullName.split(" ")
        if (nameParts.length >= 2) {
          return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        } else if (nameParts.length === 1) {
          return nameParts[0][0].toUpperCase()
        }
      }
      
      // Fallback to using email
      return user.email ? user.email[0].toUpperCase() : "?"
    }
    
    const fetchAvatarUrl = async () => {
      if (!user) return

      try {
        // First check if user has avatar_url in metadata
        const metadataUrl = user.user_metadata?.avatar_url
        if (metadataUrl) {
          setAvatarUrl(metadataUrl)
          return
        }
        
        // Then try to get from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single()
          
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        console.error("Error fetching avatar URL:", error)
      }
    }
    
    setInitials(getInitials())
    fetchAvatarUrl()
  }, [user, supabase])
  
  const colorClasses = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500"
  ]
  
  // Deterministic color based on user ID
  const userColorClass = user ? 
    colorClasses[Math.abs(user.id.charCodeAt(0) + user.id.charCodeAt(1)) % colorClasses.length] : 
    colorClasses[0]
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={avatarUrl || undefined} alt={user?.email || "User"} />
      <AvatarFallback className={userColorClass}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
