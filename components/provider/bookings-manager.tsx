"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Booking {
  id: string
  customer_id: string
  service_date: string
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes: string | null
  customer: {
    full_name: string
    email: string
  }
  service: {
    name: string
    price: number
  }
}

interface BookingsManagerProps {
  onUpdate?: () => void
}

export default function BookingsManager({ onUpdate }: BookingsManagerProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles!customer_id(full_name, email),
          service:services(name, price)
        `)
        .eq('provider_id', user.id)
        .order('service_date', { ascending: true })

      if (error) throw error
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bookings"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Booking status updated"
      })

      fetchBookings()
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{booking.service.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.service_date), 'PPP')} at {booking.start_time}
                </p>
              </div>
              <Badge className={`bg-${getStatusVariant(booking.status)}`}>
                {booking.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Customer</h4>
                <p className="text-sm">{booking.customer.full_name}</p>
                <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
              </div>

              {booking.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              )}

              {booking.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <Button
                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">No bookings found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getStatusVariant(status: Booking['status']): string {
  switch (status) {
    case 'pending':
      return 'primary'
    case 'confirmed':
      return 'secondary'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'destructive'
    default:
      return 'primary'
  }
}
