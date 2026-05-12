const PLACEHOLDER = "/blog.webp";

function apiOrigin(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base.replace(/\/api\/?$/i, "");
}

/** Builds an absolute URL for storage paths returned by Laravel. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (url == null || url === "") return PLACEHOLDER;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const origin = apiOrigin();
  if (!origin) return url.startsWith("/") ? url : `/${url}`;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}
