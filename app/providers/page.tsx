"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Filter } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

type Provider = {
  id: string
  full_name: string
  avatar_url?: string
  bio?: string
  location?: string
  avg_rating?: number
  service_category?: string
  price_range?: string
  total_bookings?: number
  featured?: boolean
}

export default function ProvidersPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [serviceCategory, setServiceCategory] = useState("all")
  const [location, setLocation] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
    fetchLocations()
    fetchProviders()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/providers/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      
      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories.map((cat: any) => cat.name || cat))
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error.message)
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const fetchLocations = async () => {
    try {
      // Fetch all countries from a REST Countries API
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name')
      if (!response.ok) throw new Error('Failed to fetch countries')
      
      const countriesData = await response.json()
      // Extract and sort country names
      const countries = countriesData
        .map((country: any) => country.name.common)
        .sort((a: string, b: string) => a.localeCompare(b))
      
      setLocations(countries)
    } catch (error: any) {
      console.error('Error fetching locations:', error.message)
      // Fallback to a basic list if API fails
      setLocations([
        'United States', 'Canada', 'United Kingdom', 'Australia', 
        'Germany', 'France', 'Japan', 'Brazil', 'India', 'China',
        'South Africa', 'Mexico', 'Italy', 'Spain', 'Russia'
      ])
    }
  }

  const fetchProviders = async () => {
    setLoading(true)
    try {
      // Instead of directly querying Supabase, use the API route
      const params = new URLSearchParams()
      if (serviceCategory !== "all" && serviceCategory) params.set("category", serviceCategory)
      if (location && location !== "all") params.set("location", location)
      if (priceRange && priceRange !== "all") {
        // Convert price range to min/max values
        if (priceRange === "$") {
          params.set("minPrice", "0")
          params.set("maxPrice", "50")
        } else if (priceRange === "$$") {
          params.set("minPrice", "50")
          params.set("maxPrice", "100")
        } else if (priceRange === "$$$") {
          params.set("minPrice", "100")
          params.set("maxPrice", "1000")
        }
      }
      
      console.log("Fetching providers with params:", Object.fromEntries(params))
      const response = await fetch(`/api/providers?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch providers")
      }
      
      const data = await response.json()
      
      // Transform API data to match the Provider type
      if (data.providers) {
        const formattedProviders: Provider[] = data.providers.map((p: any) => {
          // Ensure we don't have redundant data in name
          let providerName = p.name;
          if (p.category && providerName.includes(`${p.category} Provider`)) {
            // If the name format is "Cleaning Provider", extract just the category
            providerName = p.category;
          }
          
          return {
            id: p.id,
            full_name: providerName,
            avatar_url: p.avatar_url,
            bio: p.description,
            location: p.location,
            avg_rating: p.rating,
            service_category: p.category,
            price_range: p.hourly_rate ? `$${p.hourly_rate}/hr` : undefined,
            featured: Math.random() > 0.8 // Just for demo purposes
          };
        });
        setProviders(formattedProviders)
      } else {
        setProviders([])
      }
    } catch (error: any) {
      toast({
        title: "Error fetching providers",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    fetchProviders()
  }

  const resetFilters = () => {
    setServiceCategory("all")
    setLocation("all")
    setPriceRange("all")
    fetchProviders()
  }

  const renderRatingStars = (rating?: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < (rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Service Providers</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          Find verified and trusted service providers in your area
        </p>
      </div>

      <div className="bg-muted rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Filter Providers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="category">Service Category</Label>
            <Select value={serviceCategory} onValueChange={setServiceCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-categories" value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={`category-${category}`} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Country</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-locations" value="all">All Countries</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={`location-${loc}`} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="price">Price Range</Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger id="price">
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-price" value="all">Any Price</SelectItem>
                <SelectItem key="price-budget" value="$">$ - Budget</SelectItem>
                <SelectItem key="price-average" value="$$">$$ - Average</SelectItem>
                <SelectItem key="price-premium" value="$$$">$$$ - Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end gap-2">
            <Button onClick={handleFilter} className="flex-1">Apply Filters</Button>
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Loading providers...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-xl mb-4">No providers found matching your criteria</p>
          <Button onClick={resetFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={provider.avatar_url || ""} alt={provider.full_name} />
                      <AvatarFallback>{provider.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{provider.full_name}</CardTitle>
                      {provider.service_category && !provider.full_name.includes(provider.service_category) && (
                        <Badge variant="outline" className="mt-1">
                          {provider.service_category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {provider.featured && (
                    <Badge className="bg-primary">Featured</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                {provider.bio ? (
                  <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{provider.bio}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 mb-4 italic">No description available</p>
                )}
                
                <div className="flex items-center gap-1 mb-2">
                  {renderRatingStars(provider.avg_rating)}
                  <span className="text-sm text-gray-500 ml-1">
                    {provider.avg_rating ? provider.avg_rating.toFixed(1) : "New"} {provider.total_bookings ? `(${provider.total_bookings} bookings)` : ""}
                  </span>
                </div>
                
                {provider.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{provider.location}</span>
                  </div>
                )}
                
                {provider.price_range && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>Price: {provider.price_range}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/providers/${provider.id}`} className="w-full">
                  <Button className="w-full">View Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}