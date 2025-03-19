"use client"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import PaymentForm from "@/components/payment-form"

type Provider = {
  id: string
  name: string
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

type BookingFormProps = {
  provider: Provider
  onBookingComplete: () => void
}

export default function BookingForm({ provider, onBookingComplete }: BookingFormProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeSlot, setTimeSlot] = useState<string>("")
  const [service, setService] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  // Generate time slots based on provider's availability
  const generateTimeSlots = (selectedDate: Date) => {
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

      return slots
    }

    return []
  }

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      setAvailableTimeSlots(generateTimeSlots(newDate))
      setTimeSlot("") // Reset time slot when date changes
    }
  }

  const handleBooking = async () => {
    if (!date || !timeSlot || !service) {
      toast({
        title: "Missing information",
        description: "Please select a date, time, and service.",
        variant: "destructive",
      })
      return
    }

    // Show payment form instead of immediately booking
    setShowPayment(true)
  }

  const handlePaymentComplete = async () => {
    setIsSubmitting(true)

    try {
      // This would be replaced with an actual Supabase mutation
      // For now, we'll simulate a successful booking

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Booking successful",
        description: `Your appointment with ${provider.name} has been booked.`,
      })

      onBookingComplete()
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

  const selectedServiceDetails = provider.services.find((s) => s.name === service)

  return (
    <div className="space-y-4">
      {showPayment ? (
        <PaymentForm
          amount={selectedServiceDetails?.price || 0}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setShowPayment(false)}
        />
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={(date) => {
                    const day = date.toLocaleDateString("en-US", { weekday: "long" })
                    return !provider.availability.days.includes(day) || date < new Date()
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <Select value={timeSlot} onValueChange={setTimeSlot} disabled={!date || availableTimeSlots.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {date ? "No available times on this date" : "Select a date first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Service</label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {provider.services.map((service) => (
                  <SelectItem key={service.name} value={service.name}>
                    {service.name} - ${service.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              placeholder="Add any special requests or details about your service needs"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {selectedServiceDetails && (
            <div className="rounded-lg bg-muted p-4 mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Booking Summary</h4>
                  <p className="text-sm text-muted-foreground">{selectedServiceDetails.name}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{selectedServiceDetails.duration} minutes</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${selectedServiceDetails.price}</p>
                </div>
              </div>
            </div>
          )}

          <Button className="w-full" onClick={handleBooking} disabled={!date || !timeSlot || !service || isSubmitting}>
            {isSubmitting ? "Processing..." : "Continue to Payment"}
          </Button>
        </>
      )}
    </div>
  )
}

