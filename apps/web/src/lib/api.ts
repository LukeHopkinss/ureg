/** Thin fetch wrapper for the Worker API. Same-origin in production. */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/v1${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}`);
  return (await res.json()) as T;
}
