interface FetchNextApiJsonOptions {
  auth?: boolean;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function fetchNextApiJson<T>(
  path: string,
  options: FetchNextApiJsonOptions = {},
): Promise<T> {
  const headers = new Headers();

  if (options.auth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, {
    method: options.method ?? 'GET',
    cache: 'no-store',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`Next API request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}
