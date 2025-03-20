"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return `${hour}:00`
})

export default function AvailabilityManager() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [availability, setAvailability] = useState({
    days: [] as string[],
    hours: {
      start: "09:00",
      end: "17:00"
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('providers')
        .select('availability')
        .eq('profile_id', user.id)
        .single()

      if (error) throw error
      if (data?.availability) {
        setAvailability(data.availability)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load availability settings"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('providers')
        .update({
          availability,
          updated_at: new Date().toISOString()
        })
        .eq('profile_id', user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Availability settings updated"
      })
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
    <Card>
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Working Days</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={availability.days.includes(day)}
                  onCheckedChange={(checked) => {
                    setAvailability(prev => ({
                      ...prev,
                      days: checked
                        ? [...prev.days, day]
                        : prev.days.filter(d => d !== day)
                    }))
                  }}
                />
                <Label htmlFor={day}>{day}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Select
              value={availability.hours.start}
              onValueChange={(value: string) =>
                setAvailability(prev => ({
                  ...prev,
                  hours: { ...prev.hours, start: value }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <Select
              value={availability.hours.end}
              onValueChange={(value: string) =>
                setAvailability(prev => ({
                  ...prev,
                  hours: { ...prev.hours, end: value }
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour}>
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Availability
        </Button>
      </CardContent>
    </Card>
  )
}
