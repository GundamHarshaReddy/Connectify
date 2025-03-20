"use client"

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Database } from '@/lib/supabase-schemas'

type Category = Database['public']['Tables']['categories']['Row']

interface CategorySelectorProps {
  onCategoriesChange: (categories: string[]) => void
  defaultCategories?: string[]
  multiSelect?: boolean
  disabled?: boolean
  className?: string
}

export function CategorySelector({
  onCategoriesChange,
  defaultCategories = [],
  multiSelect = true,
  disabled = false,
  className = "",
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultCategories || [])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError('Could not load categories')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Update the selection and notify parent
  const toggleCategory = (categoryName: string) => {
    let newSelection: string[]
    
    if (multiSelect) {
      // In multi-select mode, toggle the category
      newSelection = selectedCategories.includes(categoryName)
        ? selectedCategories.filter(c => c !== categoryName)
        : [...selectedCategories, categoryName]
    } else {
      // In single-select mode, replace the selection
      newSelection = [categoryName]
      setOpen(false)
    }
    
    setSelectedCategories(newSelection)
    onCategoriesChange(newSelection)
  }

  if (loading) {
    return <Skeleton className={`h-10 w-full ${className}`} />
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Tag className="h-4 w-4 shrink-0" />
              {selectedCategories.length > 0 ? (
                <div className="flex flex-wrap gap-1 overflow-hidden">
                  {selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="shrink-0">
                      {category}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">Select categories</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => toggleCategory(category.name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCategories.includes(category.name) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
