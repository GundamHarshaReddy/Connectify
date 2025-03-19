"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, MapPin, MessageSquare, Calendar } from "lucide-react"
import Link from "next/link"
import { useSupabase } from "./supabase-provider"

type Provider = {
  id: string
  name: string
  category: string
  avatar_url: string
  rating: number
  location: string
  hourly_rate: number
}

export default function FeaturedProviders() {
  const { supabase } = useSupabase()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // This would be replaced with an actual Supabase query
        // For now, we'll use mock data
        const mockProviders: Provider[] = [
          {
            id: "1",
            name: "John Smith",
            category: "Plumbing",
            avatar_url: "",
            rating: 4.9,
            location: "New York, NY",
            hourly_rate: 75,
          },
          {
            id: "2",
            name: "Sarah Johnson",
            category: "Electrical",
            avatar_url: "",
            rating: 4.8,
            location: "Los Angeles, CA",
            hourly_rate: 85,
          },
          {
            id: "3",
            name: "Michael Brown",
            category: "Painting",
            avatar_url: "",
            rating: 4.7,
            location: "Chicago, IL",
            hourly_rate: 65,
          },
          {
            id: "4",
            name: "Emily Davis",
            category: "Cleaning",
            avatar_url: "",
            rating: 4.9,
            location: "Houston, TX",
            hourly_rate: 55,
          },
        ]

        setProviders(mockProviders)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching providers:", error)
        setLoading(false)
      }
    }

    fetchProviders()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {providers.map((provider) => (
        <Card key={provider.id}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={provider.avatar_url} alt={provider.name} />
                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{provider.name}</h3>
                <p className="text-sm text-muted-foreground">{provider.category}</p>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{provider.rating}</span>
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{provider.location}</span>
            </div>
            <div className="mt-2 text-sm font-medium">${provider.hourly_rate}/hour</div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 pt-0">
            <Link href={`/providers/${provider.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-4 w-4" /> Book
              </Button>
            </Link>
            <Link href={`/messages?provider=${provider.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" /> Chat
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

