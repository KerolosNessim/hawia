const PLACEHOLDER = "/blog.webp";

function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base.replace(/\/api\/?$/i, "");
}

function toSecureAbsoluteUrl(url: string): string {
  const https = url.startsWith("http://") ? `https://${url.slice(7)}` : url;
  try {
    return new URL(https).href;
  } catch {
    return https;
  }
}

/** True for absolute CMS/storage URLs — use `unoptimized` on `next/image` for these. */
export function isRemoteMediaUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/** Builds an absolute URL for storage paths returned by Laravel. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (url == null || url === "") return PLACEHOLDER;
  if (isRemoteMediaUrl(url)) return toSecureAbsoluteUrl(url);
  const origin = apiOrigin();
  if (!origin) return url.startsWith("/") ? url : `/${url}`;
  const path = url.startsWith("/") ? url : `/${url}`;
  return toSecureAbsoluteUrl(`${origin}${path}`);
}
