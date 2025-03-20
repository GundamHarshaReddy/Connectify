"use client"

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Database } from '@/lib/supabase-schemas'

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

// Define the default icon
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

// Define selected marker icon
const SelectedIcon = L.icon({
  iconUrl: '/images/markers/marker-selected.png', // Updated path to the selected marker
  shadowUrl: iconShadow.src,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

type Location = Database['public']['Tables']['locations']['Row']

interface MapLocationPickerProps {
  onLocationSelect: (location: Location | null) => void
  selectedLocationId?: number | null
}

// Component to set the view of the map
function SetViewOnLoad({ locations }: { locations: Location[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (locations.length > 0) {
      // Calculate bounds that include all locations
      const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [locations, map])
  
  return null
}

export function MapLocationPicker({ onLocationSelect, selectedLocationId }: MapLocationPickerProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapKey, setMapKey] = useState(Date.now()) // For forcing re-render when needed

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true)
        const response = await fetch('/api/locations')
        
        if (!response.ok) {
          throw new Error('Failed to fetch locations')
        }
        
        const data: Location[] = await response.json()
        setLocations(data)
        
        // If selectedLocationId is provided, find and select that location
        if (selectedLocationId) {
          const preSelectedLocation = data.find(loc => loc.id === selectedLocationId) || null
          setSelectedLocation(preSelectedLocation)
        }
      } catch (err) {
        console.error('Error loading locations:', err)
        setError('Could not load locations')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLocations()
  }, [selectedLocationId])

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location)
    onLocationSelect(location)
  }

  const handleClearSelection = () => {
    setSelectedLocation(null)
    onLocationSelect(null)
  }

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  if (locations.length === 0) {
    return <div className="text-center p-4">No locations available</div>
  }

  // Default center position (will be overridden by SetViewOnLoad)
  const defaultCenter: [number, number] = [51.505, -0.09]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Location</CardTitle>
        <CardDescription>
          Choose one of our available service locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full mb-4 relative">
          <MapContainer
            key={mapKey}
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                eventHandlers={{
                  click: () => handleMarkerClick(location),
                }}
                icon={selectedLocation?.id === location.id ? SelectedIcon : DefaultIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{location.name}</h3>
                    <p>{location.city}, {location.state}</p>
                    <p>{location.country}</p>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => handleMarkerClick(location)}
                    >
                      Select This Location
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            <SetViewOnLoad locations={locations} />
          </MapContainer>
        </div>
        
        {selectedLocation && (
          <div className="p-3 border rounded-md bg-muted/50 flex justify-between items-center">
            <div>
              <p className="font-medium">Selected: {selectedLocation.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.city}, {selectedLocation.state}, {selectedLocation.country}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearSelection}
            >
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
