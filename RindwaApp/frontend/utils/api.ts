const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiRequest<T>(
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
} 