const cache = new Map();

function cacheKey(lat, lng) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

export async function reverseGeocode(latitude, longitude) {
  const key = cacheKey(latitude, longitude);
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const name = data.address?.city
      || data.address?.town
      || data.address?.village
      || data.address?.county
      || data.address?.state
      || data.address?.country
      || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    cache.set(key, name);
    return name;
  } catch {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}
