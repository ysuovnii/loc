const API_BASE = import.meta.env.DEV ? '' : 'http://localhost:3000';

export async function verifyAccessCode(accessCode) {
  let response;

  try {
    response = await fetch(`${API_BASE}/api/access/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessCode }),
    });
  } catch {
    return { success: false, message: 'SERVER OFFLINE', offline: true };
  }

  const data = await response.json().catch(() => ({
    success: false,
    message: 'SERVER OFFLINE',
    offline: true,
  }));

  if (!response.ok && !data.message) {
    return { success: false, message: 'SERVER OFFLINE', offline: true };
  }

  return data;
}
