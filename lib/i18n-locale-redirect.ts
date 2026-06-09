import { routing } from "@/i18n/routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

/**
 * `localePrefix: 'as-needed'` strips the default locale (`ar`) from URLs.
 * e.g. `/ar/blogs` → `/blogs`, `/om/ar` → `/om`
 */
export function isDefaultLocalePrefixRemoval(
  fromPathname: string,
  toPathname: string,
): boolean {
  if (routing.defaultLocale !== "ar") return false;

  const from = normalizePathname(fromPathname);
  const to = normalizePathname(toPathname);

  if (from === "/ar" && to === "/") return true;
  if (from.startsWith("/ar/") && to === from.slice(3)) return true;

  if (from === "/om/ar" && to === "/om") return true;
  if (from.startsWith("/om/ar/") && to === `/om${from.slice(6)}`) return true;

  return false;
}

/** Upgrades next-intl temporary locale-prefix redirects (307) to permanent (301). */
export function promoteDefaultLocaleRedirectToPermanent(
  req: NextRequest,
  response: NextResponse,
): NextResponse {
  if (response.status !== 307 && response.status !== 302) {
    return response;
  }

  const location = response.headers.get("Location");
  if (!location) return response;

  const fromUrl = new URL(req.url);
  const toUrl = new URL(location, req.url);

  if (!isDefaultLocalePrefixRemoval(fromUrl.pathname, toUrl.pathname)) {
    return response;
  }

  const permanent = NextResponse.redirect(toUrl, 301);

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "location") return;
    permanent.headers.set(key, value);
  });

  for (const cookie of response.cookies.getAll()) {
    permanent.cookies.set(cookie);
  }

  return permanent;
}
