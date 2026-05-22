import type { NextResponse } from "next/server";

/** Response headers applied on every HTML/static response (SEO / security audits). */
export const SECURITY_RESPONSE_HEADERS: ReadonlyArray<{ key: string; value: string }> = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  /** Prevents clickjacking; allows framing only from the same origin. */
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

export function applySecurityHeadersToHeaders(headers: Headers): void {
  for (const { key, value } of SECURITY_RESPONSE_HEADERS) {
    headers.set(key, value);
  }
}

/** Attaches security headers to a `NextResponse` (middleware, redirects, etc.). */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  applySecurityHeadersToHeaders(response.headers);
  return response;
}

/** Merges security headers into a Route Handler `Response` init object. */
export function withSecurityHeaders(init?: ResponseInit): ResponseInit {
  const headers = new Headers(init?.headers);
  applySecurityHeadersToHeaders(headers);
  return { ...init, headers };
}
