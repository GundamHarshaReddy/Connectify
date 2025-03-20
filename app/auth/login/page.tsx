"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/AuthProvider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom")
  const { refreshSession } = useAuth()

  useEffect(() => {
    // Clear any error when component mounts or when email/password changes
    setError(null)
    
    // Check for sign out message with proper parameter
    const signedOut = searchParams.get("signedOut")
    if (signedOut === "true") {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        duration: 3000,
      })
    }
    
    // Check for error message in URL
    const errorMsg = searchParams.get("error")
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
    
    // Check for email verification success message
    const verified = searchParams.get("verified")
    if (verified === "true") {
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now log in.",
        duration: 5000,
      })
    }
  }, [searchParams, toast, email, password])

  const validateForm = () => {
    if (!email) {
      setError("Email is required")
      return false
    }
    if (!password) {
      setError("Password is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) return
    
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.session) {
        // Refresh the session context
        await refreshSession()
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        // Get the redirect path from URL params or default to dashboard
        const redirectTo = redirectedFrom || '/dashboard'
        
        console.log('Login successful, redirecting to:', redirectTo)
        router.push(redirectTo)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || "Failed to login")
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Determine the redirect URL - include redirectedFrom if it exists
      const redirectUrl = new URL('/auth/callback', window.location.origin)
      if (redirectedFrom) {
        redirectUrl.searchParams.set('next', redirectedFrom)
      } else {
        redirectUrl.searchParams.set('next', '/dashboard')
      }
      
      // Use signInWithOAuth with the correct options
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        },
      })
      
      if (error) throw error
      
      // The OAuth flow will redirect the user away from this page
    } catch (error: any) {
      console.error('Google login error:', error)
      setError(error.message || "Failed to login with Google")
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: error.message || "An unknown error occurred",
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Log in</CardTitle>
          <CardDescription>Enter your email and password to log in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 48 48" 
                className="w-5 h-5 mr-2"
              >
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

