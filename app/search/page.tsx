"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, MessageSquare, Calendar, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import MapView from "@/components/map-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

type Provider = {
  id: string
  name: string
  category: string
  avatar_url: string | null
  rating: number
  location: string
  hourly_rate: number
  description: string | null
  profile_id: string
}

type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export default function SearchPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [countries, setCountries] = useState<string[]>([]) // Add state for countries
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [minRating, setMinRating] = useState(0)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [userLocation, setUserLocation] = useState<string>("")
  const [distance, setDistance] = useState<number>(10) // miles
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false)

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/providers/categories")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Failed to load categories",
          description: "Please try refreshing the page.",
          variant: "destructive",
        })
      }
    }
    
    fetchCategories()
  }, [toast])

  // Fetch providers based on search criteria
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        
        // Build query parameters
        const params = new URLSearchParams()
        if (category) params.set("category", category)
        if (searchQuery) params.set("query", searchQuery)
        if (minRating > 0) params.set("minRating", minRating.toString())
        params.set("minPrice", priceRange[0].toString())
        params.set("maxPrice", priceRange[1].toString())
        
        const response = await fetch(`/api/providers?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch providers")
        }
        
        const data = await response.json()
        setProviders(data.providers || [])
      } catch (error) {
        console.error("Error fetching providers:", error)
        toast({
          title: "Failed to load service providers",
          description: "Please try refreshing the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [category, searchQuery, minRating, priceRange, toast])

  // Get user location
  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      setLocationEnabled(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you would use a geocoding service to get the address
            // For now, we'll just use the coordinates
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            setUserLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
          } catch (error) {
            console.error("Error getting location:", error)
          }
        },
        (error) => {
          console.error("Error getting user location:", error)
          setLocationEnabled(false)
        },
      )
    } else {
      setLocationEnabled(false)
    }
  }, [])

  // Add function to fetch countries in the SearchPage component
  const fetchCountries = async () => {
    try {
      // Fetch all countries from REST Countries API
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name')
      if (!response.ok) throw new Error('Failed to fetch countries')
      
      const countriesData = await response.json()
      // Extract and sort country names
      return countriesData
        .map((country: any) => country.name.common)
        .sort((a: string, b: string) => a.localeCompare(b))
    } catch (error) {
      console.error('Error fetching countries:', error)
      // Fallback countries
      return [
        'United States', 'Canada', 'United Kingdom', 'Australia', 
        'Germany', 'France', 'Japan', 'Brazil', 'India', 'China',
        'South Africa', 'Mexico', 'Italy', 'Spain', 'Russia'
      ]
    }
  }

  // Add to useEffect to fetch countries when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch countries
        const countriesList = await fetchCountries()
        // Store countries in state
        setCountries(countriesList)
      } catch (error) {
        console.error('Error loading countries:', error)
        // Set fallback countries if API fails
        setCountries([
          'United States', 'Canada', 'United Kingdom', 'Australia', 
          'Germany', 'France', 'Japan', 'Brazil', 'India', 'China',
          'South Africa', 'Mexico', 'Italy', 'Spain', 'Russia'
        ])
      }
    }
    
    loadData()
  }, []) // Empty dependency array means this runs once when component mounts

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Update URL with search parameters
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category) params.set("category", category)

    router.push(`/search?${params.toString()}`)
  }

  const applyFilters = () => {
    // Filters are applied via the useEffect that fetches providers
    // No extra filtering needed here as we're doing it server-side
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Find Service Providers</h1>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for services or providers"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Results</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label>Price Range ($/hour)</Label>
                    <div className="flex justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[0, 200]}
                      min={0}
                      max={200}
                      step={5}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Rating</Label>
                    <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {locationEnabled && (
                    <div className="space-y-2">
                      <Label>Distance from your location</Label>
                      <div className="flex justify-between text-sm">
                        <span>0 miles</span>
                        <span>{distance} miles</span>
                      </div>
                      <Slider
                        defaultValue={[10]}
                        min={1}
                        max={50}
                        step={1}
                        value={[distance]}
                        onValueChange={(value) => setDistance(value[0])}
                      />
                      <p className="text-xs text-muted-foreground">Your location: {userLocation || "Not available"}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="location">Country</Label>
                    <Select 
                      value={userLocation} 
                      onValueChange={(value) => setUserLocation(value)}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {/* Add a search option if you have many countries */}
                        <Input
                          placeholder="Search countries..."
                          className="mb-2"
                          // Add search functionality as needed
                        />
                        {/* List all countries fetched from API */}
                        {countries.length > 0 ? (
                          countries.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading">Loading countries...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="weekdays" />
                        <label htmlFor="weekdays" className="text-sm">
                          Weekdays
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="weekends" />
                        <label htmlFor="weekends" className="text-sm">
                          Weekends
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="evenings" />
                        <label htmlFor="evenings" className="text-sm">
                          Evenings
                        </label>
                      </div>
                    </div>
                  </div>
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </form>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "map")}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            {locationEnabled && (
              <Button variant="outline" size="sm" className="gap-1">
                <MapPin className="h-4 w-4 mr-1" /> Near Me
              </Button>
            )}
          </div>

          <TabsContent value="list" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
            ) : (
              <>
                {providers.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No service providers found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.map((provider) => (
                      <Card key={provider.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={provider.avatar_url || undefined} alt={provider.name} />
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
                          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{provider.description}</p>
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
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <MapView
              providers={providers.map((p) => {
                // Create a map of countries to their approximate center coordinates
                const countryCoordinates: Record<string, [number, number]> = {
                  'United States': [37.0902, -95.7129],
                  'Canada': [56.1304, -106.3468],
                  'United Kingdom': [55.3781, -3.4360],
                  'Australia': [-25.2744, 133.7751],
                  'Germany': [51.1657, 10.4515],
                  'France': [46.2276, 2.2137],
                  'Japan': [36.2048, 138.2529],
                  'Brazil': [-14.2350, -51.9253],
                  'India': [20.5937, 78.9629],
                  'China': [35.8617, 104.1954],
                  'South Africa': [-30.5595, 22.9375],
                  'Mexico': [23.6345, -102.5528],
                  'Italy': [41.8719, 12.5674],
                  'Spain': [40.4637, -3.7492],
                  'Russia': [61.5240, 105.3188],
                  'Argentina': [-38.4161, -63.6167],
                  'Nigeria': [9.0820, 8.6753],
                  'Egypt': [26.8206, 30.8025],
                  'Saudi Arabia': [23.8859, 45.0792],
                  'Turkey': [38.9637, 35.2433],
                  'Indonesia': [-0.7893, 113.9213],
                  'Thailand': [15.8700, 100.9925],
                  'South Korea': [35.9078, 127.7669],
                  'Pakistan': [30.3753, 69.3451],
                  'Philippines': [12.8797, 121.7740],
                  'Malaysia': [4.2105, 101.9758],
                  'Singapore': [1.3521, 103.8198],
                  'New Zealand': [-40.9006, 174.8860],
                  // Add more countries as needed
                };
                
                let latitude, longitude;
                
                // First try to extract coordinates from location if it's in "lat, lng" format
                if (p.location && p.location.includes(',')) {
                  const [lat, lng] = p.location.split(',').map(coord => parseFloat(coord.trim()));
                  if (!isNaN(lat) && !isNaN(lng)) {
                    latitude = lat;
                    longitude = lng;
                  }
                }
                
                // If we couldn't extract coordinates, try to find the country in our map
                if (!latitude || !longitude) {
                  // Check if the location contains any of our known countries
                  const country = Object.keys(countryCoordinates).find(c => 
                    p.location.includes(c)
                  );
                  
                  if (country) {
                    // Use the known coordinates
                    [latitude, longitude] = countryCoordinates[country];
                    
                    // Add a small random offset (±1 degree) to avoid overlapping markers
                    latitude += (Math.random() - 0.5) * 2;
                    longitude += (Math.random() - 0.5) * 2;
                  } else {
                    // Fallback to a default location (center of the world map) if country not found
                    latitude = 0;
                    longitude = 0;
                  }
                }
                
                return {
                  id: p.id,
                  name: p.name,
                  category: p.category,
                  location: p.location,
                  latitude,
                  longitude
                };
              })}
              onProviderSelect={(id) => router.push(`/providers/${id}`)}
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.slice(0, 3).map((provider) => (
                <Card
                  key={provider.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/providers/${provider.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={provider.avatar_url || undefined} alt={provider.name} />
                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{provider.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{provider.location}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

