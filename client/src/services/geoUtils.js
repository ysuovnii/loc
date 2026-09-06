/**
 * Geographic and Time Calculation Utilities
 */

/**
 * Calculates distance between two coordinates in meters using Haversine formula
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // Earth radius in meters
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
 * Human readable distance formatting (e.g. "350 m" or "4.2 km")
 */
export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) return '--';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Calculates cumulative distance over an array of coordinate points
 */
export function calculateTotalDistance(points) {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
      total += calculateDistanceMeters(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
  }
  return total;
}

/**
 * Formats relative time (e.g. "Just now", "4m ago", "2h ago")
 */
export function formatTimeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Formats time to 12-hour clock (e.g. "10:42 AM")
 */
export function formatTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
