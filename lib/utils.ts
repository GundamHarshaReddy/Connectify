import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-')
}

export function getCategoryFromSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/(^|\s)\S/g, (l) => l.toUpperCase())
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
