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
  const [serviceCategory, setServiceCategory] = useState("")
  const [location, setLocation] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  useEffect(() => {
    fetchCategories()
    fetchLocations()
    fetchProviders()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
      
      if (error) throw error
      
      if (data) {
        setCategories(data.map(cat => cat.name))
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error.message)
    }
  }

  const fetchLocations = async () => {
    try {
      // This is a placeholder. In a real app, you'd fetch actual locations
      setLocations(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'])
    } catch (error: any) {
      console.error('Error fetching locations:', error.message)
    }
  }

  const fetchProviders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'provider')
      
      if (serviceCategory) {
        query = query.eq('service_category', serviceCategory)
      }
      
      if (location) {
        query = query.eq('location', location)
      }
      
      if (priceRange) {
        query = query.eq('price_range', priceRange)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      if (data) {
        setProviders(data as Provider[])
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
    setServiceCategory("")
    setLocation("")
    setPriceRange("")
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
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
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
                <SelectItem value="">Any Price</SelectItem>
                <SelectItem value="$">$ - Budget</SelectItem>
                <SelectItem value="$$">$$ - Average</SelectItem>
                <SelectItem value="$$$">$$$ - Premium</SelectItem>
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
                      {provider.service_category && (
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
                {provider.bio && <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{provider.bio}</p>}
                
                <div className="flex items-center gap-1 mb-2">
                  {renderRatingStars(provider.avg_rating)}
                  <span className="text-sm text-gray-500 ml-1">
                    {provider.avg_rating?.toFixed(1) || "New"} {provider.total_bookings ? `(${provider.total_bookings} bookings)` : ""}
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