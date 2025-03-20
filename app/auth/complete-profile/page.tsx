"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { User } from "@supabase/supabase-js"

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/auth/login')
        return
      }
      
      setUser(user)
      
      // Pre-fill any existing data
      setFullName(user.user_metadata?.full_name || "")
      
      // Get role from URL or user metadata
      const roleParam = searchParams.get("role")
      if (roleParam && (roleParam === "customer" || roleParam === "provider")) {
        setRole(roleParam)
      } else {
        setRole(user.user_metadata?.role || "")
      }
      
      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        
      if (profile) {
        // Pre-fill with existing profile data
        setFullName(profile.full_name || "")
        setPhone(profile.phone || "")
        setBio(profile.bio || "")
        setAddress(profile.address || "")
        setRole(profile.role || "")
      }
    }
    
    getUser()
  }, [supabase, router, searchParams])

  const validateForm = () => {
    if (!fullName) {
      setError("Full name is required")
      return false
    }
    if (!role) {
      setError("Please select a role")
      return false
    }
    // Basic phone validation
    if (phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone)) {
      setError("Please enter a valid phone number")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm() || !user) return
    setLoading(true)
    
    try {
      // First update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          role: role,
        }
      })
      
      if (updateError) throw updateError
      
      // Then update or create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          email: user.email,
          phone: phone,
          bio: bio,
          address: address,
          role: role,
          updated_at: new Date().toISOString(),
        })
        
      if (profileError) throw profileError
      
      toast({
        title: "Profile completed",
        description: "Your profile has been updated successfully.",
      })
      
      // Redirect based on role
      if (role === 'provider') {
        router.push('/provider/onboarding')
      } else {
        router.push('/dashboard')
      }
      
    } catch (error: any) {
      console.error("Profile completion error:", error)
      setError(error.message)
      toast({
        variant: "destructive",
        title: "Failed to complete profile",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Please provide the following information to complete your profile</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer looking for services</SelectItem>
                  <SelectItem value="provider">Service Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                placeholder="Tell us a bit about yourself"
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Completing profile..." : "Complete Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
