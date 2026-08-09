export async function fetchNextApiJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Next API request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}
