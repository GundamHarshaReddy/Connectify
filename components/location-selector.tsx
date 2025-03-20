"use client"

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin } from "lucide-react"
import { Database } from '@/lib/supabase-schemas'

type Location = Database['public']['Tables']['locations']['Row']

interface LocationSelectorProps {
  onLocationChange: (locationId: number | null) => void
  defaultLocation?: number | null
  disabled?: boolean
  className?: string
}

export function LocationSelector({ 
  onLocationChange, 
  defaultLocation = null,
  disabled = false,
  className = ""
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>(defaultLocation?.toString() || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true)
        const response = await fetch('/api/locations')
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations')
        }
        
        const data = await response.json()
        setLocations(data)
        
        // Set default if provided and exists in the fetched data
        if (defaultLocation && data.some((loc: Location) => loc.id === defaultLocation)) {
          setSelectedLocation(defaultLocation.toString())
        }
      } catch (err) {
        console.error('Error loading locations:', err)
        setError('Could not load locations')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLocations()
  }, [defaultLocation])

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value)
    const locationId = value ? parseInt(value, 10) : null
    onLocationChange(locationId)
  }

  if (loading) {
    return <Skeleton className={`h-10 w-full ${className}`} />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <Select
      value={selectedLocation}
      onValueChange={handleLocationChange}
      disabled={disabled}
    >
      <SelectTrigger className={`flex items-center ${className}`}>
        <MapPin className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent>
        {locations.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No locations available
          </div>
        ) : (
          locations.map((location) => (
            <SelectItem key={location.id} value={location.id.toString()}>
              {location.name}, {location.city}, {location.state}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
