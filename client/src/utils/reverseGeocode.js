let lastQuery = '';
let lastName = '';

export async function reverseGeocode(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return '';

  const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  if (key === lastQuery) return lastName;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();

    const name = data?.address?.city
      || data?.address?.town
      || data?.address?.village
      || data?.address?.county
      || data?.address?.state
      || data?.display_name?.split(',').slice(0, 2).join(',')
      || '';

    lastQuery = key;
    lastName = name;
    return name;
  } catch {
    return lastName || '';
  }
}
