"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

type Review = {
  id: string
  customer_name: string
  customer_avatar: string
  rating: number
  comment: string
  created_at: string
}

export default function ReviewList({ providerId }: { providerId: string }) {
  const { supabase } = useSupabase()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // This would be replaced with an actual Supabase query
        // For now, we'll use mock data
        const mockReviews: Review[] = [
          {
            id: "1",
            customer_name: "Michael Johnson",
            customer_avatar: "",
            rating: 5,
            comment:
              "John did an excellent job fixing our leaky faucet. He was prompt, professional, and very knowledgeable. Highly recommend!",
            created_at: "2023-10-15T14:30:00Z",
          },
          {
            id: "2",
            customer_name: "Sarah Williams",
            customer_avatar: "",
            rating: 4,
            comment:
              "Good service overall. Fixed our clogged drain quickly. Only giving 4 stars because he was about 15 minutes late, but he did call to let us know.",
            created_at: "2023-09-28T10:15:00Z",
          },
          {
            id: "3",
            customer_name: "David Brown",
            customer_avatar: "",
            rating: 5,
            comment:
              "John installed a new water heater for us and did a fantastic job. He explained everything clearly and even helped us understand how to maintain it properly. Very satisfied!",
            created_at: "2023-09-10T16:45:00Z",
          },
        ]

        setReviews(mockReviews)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        setLoading(false)
      }
    }

    fetchReviews()
  }, [providerId, supabase])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.customer_avatar} alt={review.customer_name} />
              <AvatarFallback>{review.customer_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{review.customer_name}</h4>
                <span className="text-sm text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm mt-2">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

