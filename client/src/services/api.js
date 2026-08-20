const API_URL = import.meta.env.VITE_API_URL;

export async function verifyAccessCode(accessCode) {
  console.log('[API] Verifying access code');

  try {
    const res = await fetch(`${API_URL}/api/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Invalid Access Code');
      }
      if (res.status === 400) {
        throw new Error('Access Code is required');
      }
      throw new Error(data.message || `Server error (${res.status})`);
    }

    if (!data.success) {
      throw new Error(data.message || 'Verification failed');
    }

    console.log('[API] Verification successful, role:', data.role);
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      console.error('[API] Network error — server unreachable');
      throw new Error('NETWORK_ERROR');
    }
    if (err.message === 'Invalid Access Code' || err.message === 'Access Code is required') {
      console.error('[API] Verification failed:', err.message);
      throw err;
    }
    console.error('[API] Verification failed:', err.message);
    throw err;
  }
}
