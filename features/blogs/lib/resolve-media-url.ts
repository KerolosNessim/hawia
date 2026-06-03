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

/** Fixes CMS URLs with chained `/storage/https://.../storage/...` segments. */
function collapseBrokenStorageUrl(url: string): string {
  if (!url.includes("/storage/http")) return url;
  const lastStorage = url.lastIndexOf("/storage/");
  if (lastStorage < 0) return url;
  const tail = url.slice(lastStorage);
  const originMatch = url.match(/^https?:\/\/[^/]+/i);
  const origin = originMatch?.[0] ?? apiOrigin().replace(/\/api\/?$/i, "");
  return `${origin}${tail}`;
}

/** Builds an absolute URL for storage paths returned by Laravel. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (url == null || url === "") return PLACEHOLDER;
  const normalized = collapseBrokenStorageUrl(url.trim());
  if (isRemoteMediaUrl(normalized)) return toSecureAbsoluteUrl(normalized);
  const origin = apiOrigin();
  if (!origin) return url.startsWith("/") ? url : `/${url}`;
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return toSecureAbsoluteUrl(`${origin}${path}`);
}
