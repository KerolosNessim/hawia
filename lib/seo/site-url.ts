/**
 * Canonical site origin for JSON-LD and metadata.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://www.example.com).
 */
const PRODUCTION_FALLBACK = "https://hawia.vercel.app";

export function getCanonicalSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return PRODUCTION_FALLBACK;
  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** @deprecated Use {@link getCanonicalSiteUrl} */
export function getSiteUrl(): string {
  return getCanonicalSiteUrl();
}
