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

// Format currency values
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format date object or string to human-readable format
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format time (hours, minutes) from a Date object
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Create SQL-ready date string
export function toSQLDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Convert minutes to hours and minutes display
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`
  }
}

// Enhanced authentication redirect handler
export function handleAuthRedirect(
  isAuthenticated: boolean, 
  router: any, 
  destination: string = '/dashboard',
  loginPath: string = '/auth/login'
): void {
  try {
    if (isAuthenticated) {
      // If the current URL includes redirectedFrom, use that instead
      const url = new URL(window.location.href)
      const redirectedFrom = url.searchParams.get('redirectedFrom')
      const finalDestination = redirectedFrom || destination
      
      // Log for debugging
      console.log(`Redirecting authenticated user to: ${finalDestination}`)
      router.push(finalDestination)
    } else if (window.location.pathname !== loginPath && !window.location.pathname.includes('/auth/callback')) {
      // If not authenticated and not on login page or callback route, redirect to login
      // Preserve the current path for after login
      const currentPath = window.location.pathname
      const redirectUrl = `${loginPath}?redirectedFrom=${encodeURIComponent(currentPath)}`
      
      // Log for debugging
      console.log(`Redirecting unauthenticated user to: ${redirectUrl}`)
      router.push(redirectUrl)
    }
  } catch (error) {
    console.error('Auth redirect error:', error)
    // Fallback to login page on error
    router.push(loginPath)
  }
}
