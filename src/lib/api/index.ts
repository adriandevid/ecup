export function getStoredToken(): string | null {
  if (
    typeof window === 'undefined' ||
    !window.localStorage
  ) {
    return null;
  }

  return window.localStorage.getItem('futchamp_token');
}

export async function apiClient<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if(data.message) {
      throw new Error(data.message);
    }

    throw new Error(data.error || 'Erro na requisição');
  }

  return data as T;
}
