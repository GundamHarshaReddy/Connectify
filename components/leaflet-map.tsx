"use client"

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { useSupabase } from "@/components/supabase-provider"

type MapProps = {
  userLocation: { lat: number; lng: number }
  providers: {
    id: string
    name: string
    category: string
    location: string
    latitude: number
    longitude: number
  }[]
  onProviderSelect: (providerId: string) => void
}

export default function LeafletMap({ userLocation, providers, onProviderSelect }: MapProps) {
  const { supabase } = useSupabase()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([])

  // Fetch nearby users
  useEffect(() => {
    const fetchNearbyUsers = async () => {
      try {
        const response = await fetch(
          `/api/users/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}`
        )
        if (response.ok) {
          const data = await response.json()
          setNearbyUsers(data.users)
        }
      } catch (error) {
        console.error('Error fetching nearby users:', error)
      }
    }

    fetchNearbyUsers()
    
    // Set up real-time subscription for user locations
    const channel = supabase
      .channel('nearby-users')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: 'latitude=neq.null,longitude=neq.null'
        },
        (payload) => {
          setNearbyUsers(current => {
            const updated = current.map(user => 
              user.id === payload.new.id ? { ...user, ...payload.new } : user
            )
            return updated
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userLocation.lat, userLocation.lng, supabase])

  // Initialize and update map
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default

        // Cleanup previous map instance if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          markersRef.current = []
        }

        // Create map instance
        // We've already checked mapRef.current is not null above, but TypeScript needs an assertion
        const map = L.map(mapRef.current as HTMLElement).setView([userLocation.lat, userLocation.lng], 12)
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        // Add user location marker with custom icon
        const userIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background-color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div>
                </div>`,
          className: 'user-location-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Your location')

        // Add provider markers
        providers.forEach(provider => {
          if (provider.latitude && provider.longitude) {
            const providerIcon = L.divIcon({
              html: `<div style="width: 32px; height: 32px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <span style="color: var(--primary);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span>
                    </div>`,
              className: 'provider-marker',
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            })

            const marker = L.marker([provider.latitude, provider.longitude], { icon: providerIcon })
              .addTo(map)
              .bindPopup(`<strong>${provider.name}</strong><br>${provider.category}<br>${provider.location}`)
              .on('click', () => onProviderSelect(provider.id))
            
            markersRef.current.push(marker)
          }
        })

        // Add nearby users markers
        nearbyUsers.forEach(user => {
          if (user.latitude && user.longitude) {
            const userMarkerIcon = L.divIcon({
              html: `<div style="width: 32px; height: 32px; background-color: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <img src="${user.avatar_url || '/default-avatar.png'}" 
                           style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;"
                           alt="${user.full_name}"
                      />
                    </div>`,
              className: 'user-marker',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })

            const marker = L.marker([user.latitude, user.longitude], { icon: userMarkerIcon })
              .addTo(map)
              .bindPopup(`
                <div class="p-2">
                  <div class="font-semibold">${user.full_name}</div>
                  <div class="text-sm text-muted-foreground">${user.role}</div>
                </div>
              `)
            
            markersRef.current.push(marker)
          }
        })

        mapInstanceRef.current = map

        // Handle resize events
        const handleResize = () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, [userLocation, providers, onProviderSelect, nearbyUsers])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
}
