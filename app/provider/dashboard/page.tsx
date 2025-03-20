"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import ServiceManager from "@/components/provider/service-manager"
import BookingsManager from "@/components/provider/bookings-manager"
import AvailabilityManager from "@/components/provider/availability-manager"
import { Calendar, Users, Star, DollarSign } from "lucide-react"

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: number
  averageRating: number
}

export default function ProviderDashboard() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0
  })

  useEffect(() => {
    checkProviderAccess()
    fetchDashboardStats()
  }, [])

  const checkProviderAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.user_metadata.role !== 'provider') {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You must be a service provider to access this page."
      })
      router.replace('/dashboard')
      return false
    }
    return true
  }

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_id', user.id)

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('provider_id', user.id)

      const stats: DashboardStats = {
        totalBookings: bookings?.length || 0,
        pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
        completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
        totalEarnings: bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
        averageRating: reviews?.length 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0
      }

      setStats(stats)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard statistics"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          title="Total Earnings"
          value={`$${stats.totalEarnings.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <ServiceManager onUpdate={fetchDashboardStats} />
        </TabsContent>
        
        <TabsContent value="bookings">
          <BookingsManager onUpdate={fetchDashboardStats} />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
