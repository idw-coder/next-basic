interface FetchNextApiJsonOptions {
  auth?: boolean;
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

  const res = await fetch(path, {
    cache: 'no-store',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Next API request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}
