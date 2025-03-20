/**
 * Helper functions for working with images in the application
 */

/**
 * Get the full URL for a category icon
 * @param icon The icon string from the database
 */
export function getCategoryIconUrl(icon: string | null): string | null {
  if (!icon) return null;
  
  // If it's already a full URL or starts with a slash, return as is
  if (icon.startsWith('http') || icon.startsWith('/')) {
    return icon;
  }
  
  // Otherwise assume it's a filename in our categories folder
  return `/images/categories/${icon}`;
}

/**
 * Get the full URL for a location image
 * @param locationName The name of the location
 */
export function getLocationImageUrl(locationName: string): string {
  // Format the location name for use in a URL
  const formattedName = locationName.toLowerCase().replace(/\s+/g, '-');
  
  // Try to get a specific image for this location, fallback to a default
  return `/images/locations/${formattedName}.jpg`;
}

/**
 * Get a random placeholder image if no image is available
 */
export function getPlaceholderImage(type: 'service' | 'location' | 'profile' = 'service'): string {
  const placeholders = {
    service: ['/images/placeholders/service-1.jpg', '/images/placeholders/service-2.jpg'],
    location: ['/images/placeholders/location-1.jpg', '/images/placeholders/location-2.jpg'],
    profile: ['/images/placeholders/profile-1.jpg', '/images/placeholders/profile-2.jpg'],
  };
  
  const options = placeholders[type];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}
