"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, MessageSquare, Phone, Mail } from "lucide-react"
import Link from "next/link"
import ReviewList from "@/components/review-list"
import BookingForm from "@/components/booking-form"

type Provider = {
  id: string
  name: string
  category: string
  avatar_url: string
  rating: number
  location: string
  hourly_rate: number
  description: string
  phone: string
  email: string
  years_experience: number
  availability: {
    days: string[]
    hours: {
      start: string
      end: string
    }
  }
  services: {
    name: string
    price: number
    duration: number
  }[]
}

export default function ProviderDetailPage() {
  const params = useParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [bookingNotes, setBookingNotes] = useState<string>("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        // This would be replaced with an actual Supabase query
        // For now, we'll use mock data based on the ID
        let mockProvider: Provider

        if (params.id === "1") {
          mockProvider = {
            id: "1",
            name: "John Smith",
            category: "Home Repair",
            avatar_url: "",
            rating: 4.9,
            location: "New York, NY",
            hourly_rate: 75,
            description:
              "Professional handyman with over 10 years of experience in residential and commercial repairs. Specializing in plumbing, electrical work, carpentry, and general home maintenance. Licensed and insured with a commitment to quality workmanship and customer satisfaction.",
            phone: "(555) 123-4567",
            email: "john.smith@example.com",
            years_experience: 10,
            availability: {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              hours: {
                start: "08:00",
                end: "17:00",
              },
            },
            services: [
              {
                name: "Basic Home Inspection",
                price: 75,
                duration: 60,
              },
              {
                name: "Plumbing Repair",
                price: 120,
                duration: 90,
              },
              {
                name: "Electrical Work",
                price: 150,
                duration: 120,
              },
              {
                name: "Furniture Assembly",
                price: 100,
                duration: 60,
              },
            ],
          }
        } else if (params.id === "2") {
          mockProvider = {
            id: "2",
            name: "Sarah Johnson",
            category: "Tutoring",
            avatar_url: "",
            rating: 4.8,
            location: "Los Angeles, CA",
            hourly_rate: 50,
            description:
              "Experienced math and science tutor with a Master's degree in Education. I specialize in helping middle and high school students excel in algebra, calculus, physics, and chemistry. My teaching approach focuses on building strong foundations and developing problem-solving skills.",
            phone: "(555) 234-5678",
            email: "sarah.johnson@example.com",
            years_experience: 8,
            availability: {
              days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"],
              hours: {
                start: "15:00",
                end: "20:00",
              },
            },
            services: [
              {
                name: "Math Tutoring (Algebra/Calculus)",
                price: 50,
                duration: 60,
              },
              {
                name: "Physics Tutoring",
                price: 55,
                duration: 60,
              },
              {
                name: "Chemistry Tutoring",
                price: 55,
                duration: 60,
              },
              {
                name: "Test Prep (SAT/ACT)",
                price: 65,
                duration: 90,
              },
            ],
          }
        } else {
          mockProvider = {
            id: "3",
            name: "Michael Brown",
            category: "Personal Training",
            avatar_url: "",
            rating: 4.7,
            location: "Chicago, IL",
            hourly_rate: 65,
            description:
              "Certified personal trainer with expertise in strength training, weight loss, and functional fitness. I create personalized workout plans tailored to your goals and fitness level. Whether you're a beginner or advanced, I'll help you achieve sustainable results through proper technique and consistent progress.",
            phone: "(555) 345-6789",
            email: "michael.brown@example.com",
            years_experience: 6,
            availability: {
              days: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
              hours: {
                start: "06:00",
                end: "20:00",
              },
            },
            services: [
              {
                name: "One-on-One Training Session",
                price: 65,
                duration: 60,
              },
              {
                name: "Fitness Assessment",
                price: 50,
                duration: 45,
              },
              {
                name: "Nutrition Consultation",
                price: 60,
                duration: 60,
              },
              {
                name: "Group Training (2-3 people)",
                price: 45,
                duration: 60,
              },
            ],
          }
        }

        setProvider(mockProvider)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching provider:", error)
        setLoading(false)
      }
    }

    fetchProvider()
  }, [params.id, supabase])

  useEffect(() => {
    if (selectedDate && provider) {
      // Generate time slots based on provider's availability
      // This would be replaced with an actual availability check
      const day = selectedDate.toLocaleDateString("en-US", { weekday: "long" })

      if (provider.availability.days.includes(day)) {
        const slots = []
        const start = Number.parseInt(provider.availability.hours.start.split(":")[0])
        const end = Number.parseInt(provider.availability.hours.end.split(":")[0])

        for (let hour = start; hour < end; hour++) {
          slots.push(`${hour.toString().padStart(2, "0")}:00`)
          if (hour < end - 1) {
            slots.push(`${hour.toString().padStart(2, "0")}:30`)
          }
        }

        setAvailableTimeSlots(slots)
      } else {
        setAvailableTimeSlots([])
      }
    }
  }, [selectedDate, provider])

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedService) {
      toast({
        title: "Missing information",
        description: "Please select a date, time, and service.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // This would be replaced with an actual Supabase mutation
      // For now, we'll simulate a successful booking

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Booking successful",
        description: `Your appointment with ${provider?.name} has been booked.`,
      })

      router.push("/bookings")
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Provider not found</h3>
          <p className="text-muted-foreground mb-4">
            The provider you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col space-y-6">
            {/* Provider Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={provider.avatar_url} alt={provider.name} />
                  <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{provider.name}</h1>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="mr-2">
                      {provider.category}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{provider.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 mt-4 md:mt-0">
                <Link href={`/messages?provider=${provider.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MessageSquare className="h-4 w-4" /> Message
                  </Button>
                </Link>
                <Link href={`tel:${provider.phone}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                </Link>
              </div>
            </div>

            {/* Provider Info */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{provider.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{provider.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{provider.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{provider.years_experience} years experience</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Services offered by {provider.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {provider.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">Duration: {service.duration} minutes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${service.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>What customers are saying about {provider.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewList providerId={provider.id} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>Select a date, time, and service</CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm provider={provider} onBookingComplete={() => router.push("/bookings")} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

