"use client"

import React, { useState, useEffect, JSX, ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Home as HomeIcon, Car, Scissors, Laptop, BookOpen, Dumbbell, Music, Shirt, Camera, Utensils, Palette, LucideIcon } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Define a type for the category icons mapping
type CategoryIconMap = {
  [key: string]: LucideIcon
}

// Update the categoryIcons object with proper typing
const categoryIcons: CategoryIconMap = {
  "Tutoring": BookOpen,
  "Home Repair": Wrench,
  "Personal Training": Dumbbell,
  "Cleaning": HomeIcon, // Changed from House to Home
  "Auto Repair": Car,
  "Beauty & Wellness": Scissors,
  "Music Lessons": Music,
  "Tech Support": Laptop,
  "Fashion Services": Shirt,
  "Photography": Camera,
  "Catering": Utensils,
  "Art & Design": Palette
}

// Define category colors
const categoryColors = [
  { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-600 dark:text-blue-300" },
  { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-600 dark:text-yellow-300" },
  { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-600 dark:text-purple-300" },
  { bg: "bg-green-100 dark:bg-green-900", text: "text-green-600 dark:text-green-300" },
  { bg: "bg-red-100 dark:bg-red-900", text: "text-red-600 dark:text-red-300" },
  { bg: "bg-pink-100 dark:bg-pink-900", text: "text-pink-600 dark:text-pink-300" },
  { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-600 dark:text-orange-300" },
  { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-600 dark:text-indigo-300" },
  { bg: "bg-teal-100 dark:bg-teal-900", text: "text-teal-600 dark:text-teal-300" },
  { bg: "bg-cyan-100 dark:bg-cyan-900", text: "text-cyan-600 dark:text-cyan-300" },
  { bg: "bg-amber-100 dark:bg-amber-900", text: "text-amber-600 dark:text-amber-300" },
  { bg: "bg-lime-100 dark:bg-lime-900", text: "text-lime-600 dark:text-lime-300" }
]

type CategoryData = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

interface CategoryCardProps {
  name: string
  icon: React.ReactNode
  slug: string
  iconUrl?: string | null
}

export function CategoryCard({ name, icon, slug, iconUrl }: CategoryCardProps) {
  return (
    <Link href={`/services/category/${slug}`}>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary relative w-14 h-14 flex items-center justify-center">
            {iconUrl ? (
              <Image 
                src={iconUrl} 
                alt={name} 
                width={32} 
                height={32} 
                className="object-contain"
              />
            ) : (
              icon
            )}
          </div>
          <h3 className="text-center font-medium">{name}</h3>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ServiceCategoryCards() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/providers/categories")
        
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Failed to load service categories",
          description: "Please try refreshing the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  type IconType = JSX.Element | null

  const getIconComponent = (iconName: string | null): IconType => {
    if (!iconName) return null
    
    const IconComponent = categoryIcons[iconName]
    if (IconComponent) {
      return <IconComponent className="h-6 w-6" />
    }
    
    return null
  }

  // Generate a category card with the correct icon and color
  const getCategoryCard = (category: CategoryData, index: number) => {
    const colorIndex = index % categoryColors.length
    const color = categoryColors[colorIndex]
    
    // Initialize icon with default
    let icon: IconType = <Wrench className="h-8 w-8" />
    let iconUrl: string | null = null
    
    if (category.icon) {
      if (category.icon.startsWith('/') || category.icon.startsWith('http')) {
        iconUrl = category.icon
      } else {
        const customIcon = getIconComponent(category.icon)
        if (customIcon) {
          icon = customIcon
        }
      }
    }
    
    const href = `/search?category=${encodeURIComponent(category.slug)}`

    return (
      <Link href={href} key={category.id}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className={`p-3 rounded-full ${color.bg} ${color.text} mb-4 relative w-14 h-14 flex items-center justify-center`}>
              {iconUrl ? (
                <Image 
                  src={iconUrl} 
                  alt={category.name} 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              ) : (
                icon
              )}
            </div>
            <h3 className="font-medium text-center">{category.name}</h3>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {loading ? (
        // Show skeleton loading state
        Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 h-14 w-14 mb-4"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))
      ) : (
        // Show actual categories
        categories.map((category, index) => getCategoryCard(category, index))
      )}
    </div>
  )
}

