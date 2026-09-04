/**
 * OpenStreetMap Nominatim Service
 * 
 * What is Reverse Geocoding?
 * It is the process of converting geographic coordinates (Latitude and Longitude)
 * into a human-readable address or location name (such as City, Town, or Country).
 * 
 * OpenStreetMap provides this service completely FREE via its "Nominatim" API.
 */

// In-memory cache to store previously looked-up coordinates.
// This prevents sending duplicate requests for the same area, saving network bandwidth.
const cache = new Map();

// Helper function to create a simplified coordinate key (rounded to 3 decimal places)
function cacheKey(lat, lng) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/**
 * Converts latitude and longitude into a readable place name using OpenStreetMap Nominatim.
 * @param {number} latitude - GPS Latitude
 * @param {number} longitude - GPS Longitude
 * @returns {Promise<string>} Human-readable location name
 */
export async function reverseGeocode(latitude, longitude) {
  const key = cacheKey(latitude, longitude);

  // Return cached result if we already looked up this location recently
  if (cache.has(key)) {
    return cache.get(key);
  }

  try {
    // Call the free OpenStreetMap Nominatim Reverse Geocoding API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the most specific location name available
    const locationName =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.suburb ||
      data.address?.county ||
      data.address?.state ||
      data.address?.country ||
      `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    // Save to cache for future requests
    cache.set(key, locationName);
    return locationName;
  } catch (error) {
    console.warn('[OpenStreetMap Nominatim] Geocode fallback:', error.message);
    // Fallback: If network fails, display coordinates nicely
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

