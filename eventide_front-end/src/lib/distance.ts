/**
 * Distance Calculation Utilities
 * Provides functions for calculating and formatting distances
 */

/**
 * Calculate great-circle distance between two points using Haversine formula
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format meters to human-readable distance string
 * @param meters Distance in meters
 * @returns Formatted distance string
 */
export function formatDistanceFromMeters(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format kilometers to human-readable distance string
 * @param kilometers Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(kilometers: number): string {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  }
  return `${kilometers.toFixed(1)}km`;
}

/**
 * Format seconds to human-readable duration string
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);

  if (minutes < 1) {
    return `${seconds}s`;
  }

  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Get distance category/label for display
 * @param kilometers Distance in kilometers
 * @returns Category label
 */
export function getDistanceCategory(kilometers: number): 'very-close' | 'close' | 'moderate' | 'far' {
  if (kilometers < 1) return 'very-close';
  if (kilometers < 5) return 'close';
  if (kilometers < 20) return 'moderate';
  return 'far';
}

/**
 * Get color for distance badge based on distance
 * @param kilometers Distance in kilometers
 * @returns Color class name for Tailwind/HeroUI
 */
export function getDistanceColor(kilometers: number): 'success' | 'warning' | 'default' | 'danger' {
  const category = getDistanceCategory(kilometers);
  switch (category) {
    case 'very-close':
      return 'success';
    case 'close':
      return 'warning';
    case 'moderate':
      return 'default';
    case 'far':
      return 'danger';
  }
}
