import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, CalendarClock, Star } from "lucide-react"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { getPlaceholderImage } from "@/lib/image-utils"
import { Database } from "@/lib/supabase-schemas"

type Service = Database['public']['Tables']['services']['Row'] & {
  profiles?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  locations?: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
  reviews_aggregate?: {
    aggregate?: {
      avg?: {
        rating: number;
      };
      count?: number;
    };
  };
}

interface ServiceCardProps {
  service: Service
  compact?: boolean
}

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const {
    id,
    name,
    description,
    price,
    duration,
    category,
    image_url,
    locations,
    profiles,
    reviews_aggregate
  } = service

  const location = locations ? `${locations.name}, ${locations.city}` : null
  const providerName = profiles?.full_name || "Service Provider"
  
  // Get average rating and review count if available
  const averageRating = reviews_aggregate?.aggregate?.avg?.rating || 0
  const reviewCount = reviews_aggregate?.aggregate?.count || 0
  
  // Round average rating to nearest half
  const displayRating = Math.round(averageRating * 2) / 2
  
  // Always use an image - either the provided one or a placeholder
  const displayImage = image_url || getPlaceholderImage('service')

  if (compact) {
    return (
      <Link href={`/services/${id}`} className="block">
        <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative h-48 w-full">
            <Image
              src={displayImage}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg truncate">{name}</h3>
            <p className="text-muted-foreground text-sm mb-2 truncate">{providerName}</p>
            <div className="flex justify-between items-center">
              <Badge variant="outline">{category}</Badge>
              <p className="font-semibold">{formatCurrency(price)}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
      <div className="relative h-48 w-full">
        <Image
          src={displayImage}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl truncate">{name}</CardTitle>
            <CardDescription className="line-clamp-1">{providerName}</CardDescription>
          </div>
          <Badge variant="outline">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(duration)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-32">{location}</span>
            </div>
          )}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{displayRating.toFixed(1)} ({reviewCount})</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <p className="font-semibold text-lg">{formatCurrency(price)}</p>
        <Link href={`/services/${id}`}>
          <Button size="sm">
            <CalendarClock className="mr-2 h-4 w-4" />
            Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
