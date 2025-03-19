"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, MessageSquare } from "lucide-react"
import Link from "next/link"

type Booking = {
  id: string
  provider_id: string
  provider_name: string
  provider_avatar: string
  service: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes: string | null
}

export default function BookingsPage() {
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all")

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // This would be replaced with an actual Supabase query
        // For now, we'll use mock data
        const mockBookings: Booking[] = [
          {
            id: "1",
            provider_id: "1",
            provider_name: "John Smith",
            provider_avatar: "",
            service: "Plumbing Repair",
            date: "2023-11-15",
            time: "14:00",
            status: "confirmed",
            notes: "Leaky faucet in the kitchen",
          },
          {
            id: "2",
            provider_id: "2",
            provider_name: "Sarah Johnson",
            provider_avatar: "",
            service: "Electrical Inspection",
            date: "2023-11-20",
            time: "10:30",
            status: "pending",
            notes: "Need to check circuit breaker",
          },
          {
            id: "3",
            provider_id: "3",
            provider_name: "Michael Brown",
            provider_avatar: "",
            service: "Painting Service",
            date: "2023-11-05",
            time: "09:00",
            status: "completed",
            notes: "Living room walls",
          },
          {
            id: "4",
            provider_id: "4",
            provider_name: "Emily Davis",
            provider_avatar: "",
            service: "House Cleaning",
            date: "2023-10-25",
            time: "13:00",
            status: "cancelled",
            notes: null,
          },
        ]

        setBookings(mockBookings)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        setLoading(false)
      }
    }

    fetchBookings()
  }, [supabase])

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

  const filteredBookings = activeTab === "all" ? bookings : bookings.filter((booking) => booking.status === activeTab)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Your Bookings</h1>
          <Link href="/search">
            <Button>Book New Service</Button>
          </Link>
        </div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full md:w-[600px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Bookings"
                    : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings`}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all"
                    ? "View all your bookings"
                    : activeTab === "pending"
                      ? "Bookings awaiting confirmation"
                      : activeTab === "confirmed"
                        ? "Upcoming confirmed appointments"
                        : activeTab === "completed"
                          ? "Past completed services"
                          : "Cancelled appointments"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg animate-pulse">
                        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="space-y-2 flex-1">
                          <div className="flex justify-between">
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={booking.provider_avatar} alt={booking.provider_name} />
                            <AvatarFallback>{booking.provider_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{booking.service}</h3>
                            <p className="text-sm text-muted-foreground">with {booking.provider_name}</p>
                            <div className="flex items-center mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{booking.date}</span>
                              <Clock className="h-4 w-4 ml-3 mr-1" />
                              <span>{booking.time}</span>
                            </div>
                            {booking.notes && (
                              <p className="text-sm mt-2 text-muted-foreground">Note: {booking.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end mt-4 md:mt-0">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <div className="flex space-x-2 mt-3">
                            {booking.status === "pending" || booking.status === "confirmed" ? (
                              <>
                                <Link href={`/messages?provider=${booking.provider_id}`}>
                                  <Button variant="outline" size="sm" className="gap-1">
                                    <MessageSquare className="h-4 w-4" /> Message
                                  </Button>
                                </Link>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  Cancel
                                </Button>
                              </>
                            ) : booking.status === "completed" ? (
                              <Button variant="outline" size="sm" className="gap-1">
                                <Star className="h-4 w-4" /> Review
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      {activeTab === "all"
                        ? "You don't have any bookings yet."
                        : `You don't have any ${activeTab} bookings.`}
                    </p>
                    <Link href="/search">
                      <Button>Find Services</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

