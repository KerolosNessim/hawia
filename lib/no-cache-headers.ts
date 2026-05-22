/** Prevents browser and CDN (e.g. Vercel edge) from serving stale responses. */
export const NO_CACHE_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
} as const;

export const NO_CACHE_HEADER_ENTRIES: ReadonlyArray<{ key: string; value: string }> =
  Object.entries(NO_CACHE_RESPONSE_HEADERS).map(([key, value]) => ({ key, value }));

export function applyNoCacheHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(NO_CACHE_RESPONSE_HEADERS)) {
    headers.set(key, value);
  }
}