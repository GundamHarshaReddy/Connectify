"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"

// Import Leaflet styles in a way that works with React 19
import dynamic from 'next/dynamic'

type Provider = {
  id: string
  name: string
  category: string
  location: string
  latitude: number
  longitude: number
}

type MapViewProps = {
  providers: Provider[]
  onProviderSelect: (providerId: string) => void
}

// Create a dynamic component that loads Leaflet only on the client side
const MapWithNoSSR = dynamic(() => import('@/components/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

export default function MapView({ providers, onProviderSelect }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting user location:", error)
          // Default to a central location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 }) // New York City as default
        }
      )
    } else {
      console.error("Geolocation is not supported by this browser")
      setUserLocation({ lat: 40.7128, lng: -74.0060 }) // New York City as default
    }
  }, [])

  return (
    <Card className="w-full h-[500px] relative overflow-hidden">
      {userLocation ? (
        <MapWithNoSSR 
          userLocation={userLocation} 
          providers={providers} 
          onProviderSelect={onProviderSelect} 
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Getting your location...</p>
          </div>
        </div>
      )}
    </Card>
  )
}

