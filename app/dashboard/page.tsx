"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MessageSquare, Star, User, Settings } from "lucide-react"
import Link from "next/link"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type Booking = {
  id: string
  provider_name: string
  provider_avatar: string
  service: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
}

type Message = {
  id: string
  sender_name: string
  sender_avatar: string
  content: string
  created_at: string
  unread: boolean
}

export default function DashboardPage() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch user profile
        // This would be replaced with an actual Supabase query
        // For now, we'll use mock data
        setProfile({
          id: user.id,
          full_name: user.user_metadata.full_name || "User",
          avatar_url: user.user_metadata.avatar_url || "",
          role: user.user_metadata.role || "customer",
          email: user.email,
        })

        // Fetch bookings
        const mockBookings: Booking[] = [
          {
            id: "1",
            provider_name: "John Smith",
            provider_avatar: "",
            service: "Plumbing Repair",
            date: "2023-11-15",
            time: "14:00",
            status: "confirmed",
          },
          {
            id: "2",
            provider_name: "Sarah Johnson",
            provider_avatar: "",
            service: "Electrical Inspection",
            date: "2023-11-20",
            time: "10:30",
            status: "pending",
          },
          {
            id: "3",
            provider_name: "Michael Brown",
            provider_avatar: "",
            service: "Painting Service",
            date: "2023-11-05",
            time: "09:00",
            status: "completed",
          },
        ]

        // Fetch messages
        const mockMessages: Message[] = [
          {
            id: "1",
            sender_name: "John Smith",
            sender_avatar: "",
            content: "I'll be there at 2pm tomorrow.",
            created_at: "2023-11-01T14:30:00Z",
            unread: false,
          },
          {
            id: "2",
            sender_name: "Sarah Johnson",
            sender_avatar: "",
            content: "Thanks for the quick service!",
            created_at: "2023-10-28T10:15:00Z",
            unread: true,
          },
        ]

        setBookings(mockBookings)
        setMessages(mockMessages)
      }

      setLoading(false)
    }

    getUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Please log in</h3>
          <p className="text-muted-foreground mb-4">You need to be logged in to view your dashboard.</p>
          <Link href="/auth/login">
            <Button>Log in</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback>{profile?.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome, {profile?.full_name}</h1>
              <p className="text-muted-foreground">{profile?.role === "provider" ? "Service Provider" : "Customer"}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href="/profile">
              <Button variant="outline" className="gap-1">
                <User className="h-4 w-4" /> Profile
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="gap-1">
                <Settings className="h-4 w-4" /> Settings
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/bookings" className="text-sm text-primary hover:underline">
                    View all bookings
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messages.filter((m) => m.unread).length}</div>
                </CardContent>
                <CardFooter>
                  <Link href="/messages" className="text-sm text-primary hover:underline">
                    View all messages
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.filter((b) => b.status === "completed").length}</div>
                </CardContent>
                <CardFooter>
                  <Link href="/bookings?status=completed" className="text-sm text-primary hover:underline">
                    View history
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest bookings and messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Upcoming Bookings</h3>
                    {bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length > 0 ? (
                      <div className="space-y-3">
                        {bookings
                          .filter((b) => b.status === "confirmed" || b.status === "pending")
                          .slice(0, 2)
                          .map((booking) => (
                            <div key={booking.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{booking.service}</h4>
                                    <p className="text-sm text-muted-foreground">with {booking.provider_name}</p>
                                  </div>
                                  <Badge className={getStatusColor(booking.status)}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{booking.date}</span>
                                  <Clock className="h-4 w-4 ml-3 mr-1" />
                                  <span>{booking.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No upcoming bookings.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Recent Messages</h3>
                    {messages.length > 0 ? (
                      <div className="space-y-3">
                        {messages.slice(0, 2).map((message) => (
                          <div key={message.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
                              <AvatarFallback>{message.sender_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{message.sender_name}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1 line-clamp-1">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No recent messages.</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/bookings">
                  <Button variant="outline" className="gap-1">
                    <Calendar className="h-4 w-4" /> All Bookings
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline" className="gap-1">
                    <MessageSquare className="h-4 w-4" /> All Messages
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>Manage your upcoming and past appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={booking.provider_avatar} alt={booking.provider_name} />
                          <AvatarFallback>{booking.provider_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{booking.service}</h4>
                              <p className="text-sm text-muted-foreground">with {booking.provider_name}</p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{booking.date}</span>
                            <Clock className="h-4 w-4 ml-3 mr-1" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex justify-end mt-3 space-x-2">
                            {booking.status === "pending" || booking.status === "confirmed" ? (
                              <>
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  Cancel
                                </Button>
                              </>
                            ) : booking.status === "completed" ? (
                              <Button variant="outline" size="sm" className="gap-1">
                                <Star className="h-4 w-4" /> Leave Review
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
                    <Link href="/search">
                      <Button>Find Services</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Messages</CardTitle>
                <CardDescription>Recent conversations with service providers</CardDescription>
              </CardHeader>
              <CardContent>
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Link key={message.id} href={`/messages?sender=${message.id}`}>
                        <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
                            <AvatarFallback>{message.sender_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{message.sender_name}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1 line-clamp-2">{message.content}</p>
                          </div>
                          {message.unread && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">You don't have any messages yet.</p>
                    <Link href="/search">
                      <Button>Find Services</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/messages" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Messages
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Reviews</CardTitle>
                <CardDescription>Reviews you've received or given</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't given or received any reviews yet.</p>
                  <Link href="/bookings?status=completed">
                    <Button>Leave a Review</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

