"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  is_active: boolean
}

interface ServiceManagerProps {
  onUpdate?: () => void
}

export default function ServiceManager({ onUpdate }: ServiceManagerProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load services"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const newService = {
        provider_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        is_active: true
      }

      const { error } = await supabase
        .from('services')
        .insert([newService])

      if (error) throw error

      toast({
        title: "Success",
        description: "Service added successfully"
      })

      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
      })

      fetchServices()
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Add New Service</CardTitle>
            <CardDescription>Create a new service offering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Add Service</Button>
          </CardFooter>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onUpdate={fetchServices}
          />
        ))}
      </div>
    </div>
  )
}

function ServiceCard({ service, onUpdate }: { service: Service; onUpdate: () => void }) {
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const toggleActive = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Service ${service.is_active ? 'disabled' : 'enabled'}`
      })

      onUpdate()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>${service.price}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
        <p className="text-sm">Duration: {service.duration} minutes</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant={service.is_active ? "default" : "outline"}
          onClick={toggleActive}
        >
          {service.is_active ? "Active" : "Inactive"}
        </Button>
      </CardFooter>
    </Card>
  )
}
