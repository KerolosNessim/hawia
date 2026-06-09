import createMiddleware from 'next-intl/middleware';
import { localePath } from '@/features/blogs/lib/blog-routes';
import { routing } from './i18n/routing';
import type { Locale } from 'next-intl';
import { promoteDefaultLocaleRedirectToPermanent } from '@/lib/i18n-locale-redirect';
import { applySecurityHeaders } from '@/lib/security-headers';
import {
  isLegacyOmanEnglishPath,
  migrateLegacyOmanEnglishPath,
  parseCountryPath,
  resolveSupportedCountry,
  withCountryPrefix,
} from '@/features/shared/lib/country-routes';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/checkout'];
// Routes that should NOT be accessible if already authenticated
const authRoutes = ['/login', '/register'];

type ResolvedRedirect = {
  status_code?: number;
  status?: number;
  target_path?: string | null;
  targetPath?: string | null;
  target_url?: string | null;
  targetUrl?: string | null;
  to?: string | null;
};

function redirectStatusCode(value: unknown): 301 | 302 | 307 | 308 | 404 | 410 | null {
  const n = Number(value);
  if (n === 301 || n === 302 || n === 307 || n === 308 || n === 404 || n === 410) return n;
  return null;
}

function pickRedirectTarget(data: ResolvedRedirect): string {
  return String(data.target_path ?? data.targetPath ?? data.target_url ?? data.targetUrl ?? data.to ?? "").trim();
}

/**
 * next-intl returns `NextResponse.next()` when the intl path equals the request path
 * (e.g. `/en`). For Oman browser URLs (`/en/om`, `/en/om/...`) that leaves Next.js
 * routing the visible path and `om` is treated as an unknown segment → 404.
 */
function ensureOmanIntlRewrite(
  originalReq: NextRequest,
  response: NextResponse,
  pathWithoutCountry: string,
  requestHeaders: Headers,
): NextResponse {
  if (response.headers.get('x-middleware-rewrite')) return response;
  if (response.status >= 300 && response.status < 400) return response;

  const rewriteUrl = new URL(
    pathWithoutCountry + originalReq.nextUrl.search,
    originalReq.url,
  );
  const rewrite = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });

  response.headers.forEach((value, key) => {
    rewrite.headers.set(key, value);
  });

  for (const cookie of response.cookies.getAll()) {
    rewrite.cookies.set(cookie);
  }

  return rewrite;
}

function applyOmanPrefixToIntlResponse(
  req: NextRequest,
  response: NextResponse,
  countryCode: 'SA' | 'OM',
): NextResponse {
  if (countryCode !== 'OM') return response;

  const location = response.headers.get('Location');
  if (!location) return response;

  const toUrl = new URL(location, req.url);
  const prefixed = withCountryPrefix('OM', toUrl.pathname);
  if (prefixed === toUrl.pathname) return response;

  toUrl.pathname = prefixed;
  const next = NextResponse.redirect(toUrl, response.status);

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'location') return;
    next.headers.set(key, value);
  });

  for (const cookie of response.cookies.getAll()) {
    next.cookies.set(cookie);
  }

  return next;
}

function redirectLookupPaths(pathname: string): string[] {
  const { pathname: withoutCountry } = parseCountryPath(pathname);
  const candidates = [pathname, withoutCountry];

  const paths = new Set<string>();
  for (const candidate of candidates) {
    if (/^\/(?:ar|en)\/(?:blogs|services)\//.test(candidate)) paths.add(candidate);
    if (/^\/(?:blogs|services)\//.test(candidate)) {
      paths.add(candidate);
      paths.add(`/ar${candidate}`);
      paths.add(`/en${candidate}`);
    }
  }

  return [...paths];
}

async function resolveConfiguredRedirect(req: NextRequest, pathname: string) {
  const lookupPaths = redirectLookupPaths(pathname);
  if (!lookupPaths.length) return null;

  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) return null;

  try {
    for (const lookupPath of lookupPaths) {
      const url = `${base}/v1/redirects/resolve?path=${encodeURIComponent(lookupPath)}`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const body = await res.json();
      const data = (body?.data ?? body?.redirect ?? body) as ResolvedRedirect | null;
      if (!data || typeof data !== "object") continue;
      const status = redirectStatusCode(data.status_code ?? data.status);
      if (!status) continue;

      if (status === 410) {
        return new NextResponse("Gone", { status: 410 });
      }
      if (status === 404) {
        const locale = lookupPath.startsWith("/en/") ? "en" : "ar";
        return NextResponse.rewrite(new URL(localePath(locale as Locale, "/404"), req.url), { status: 404 });
      }

      const target = pickRedirectTarget(data);
      if (!target || target === lookupPath || target === pathname) continue;
      return NextResponse.redirect(new URL(target, req.url), status);
    }

    return null;
  } catch {
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  const { countryCode: urlCountry, pathname: pathWithoutCountry } = parseCountryPath(pathname);

  if (isLegacyOmanEnglishPath(pathname)) {
    const migrated = migrateLegacyOmanEnglishPath(pathname);
    const redirectUrl = new URL(migrated + req.nextUrl.search, req.url);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl, 301));
  }

  const geoCountry = resolveSupportedCountry(
    req.headers.get('x-vercel-ip-country') ??
    req.headers.get('cf-ipcountry') ??
    undefined,
  );
  const effectiveCountry = urlCountry;

  // First-time Oman geo visitors only — never trap users who chose SA URLs via cookie.
  if (geoCountry === "OM" && urlCountry === "SA" && !req.cookies.get('user_country')) {
    const omanPath = withCountryPrefix("OM", pathname);
    if (omanPath !== pathname) {
      const redirectUrl = new URL(omanPath, req.url);
      redirectUrl.search = req.nextUrl.search;
      return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }
  }

  const pathParts = pathWithoutCountry.split('/');
  const localeSegment = pathParts[1];
  const hasLocalePrefix = (routing.locales as readonly string[]).includes(localeSegment);
  const currentLocale = (hasLocalePrefix ? localeSegment : routing.defaultLocale) as Locale;
  const actualPath = hasLocalePrefix
    ? `/${pathParts.slice(2).join('/')}` || '/'
    : pathWithoutCountry;

  const configuredRedirect = await resolveConfiguredRedirect(req, pathWithoutCountry);
  if (configuredRedirect) {
    return applySecurityHeaders(configuredRedirect);
  }

  // 1. If trying to access a protected route without a token
  if (protectedRoutes.some(route => actualPath.startsWith(route)) && !token) {
    const loginUrl = new URL(
      withCountryPrefix(effectiveCountry, localePath(currentLocale, '/login')),
      req.url,
    );
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // 2. If trying to access login/register with a token
  if (authRoutes.some(route => actualPath === route) && token) {
    const homeUrl = new URL(
      withCountryPrefix(effectiveCountry, localePath(currentLocale, '/')),
      req.url,
    );
    return applySecurityHeaders(NextResponse.redirect(homeUrl));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-country-route', effectiveCountry);

  const intlRequest =
    urlCountry === "OM"
      ? new NextRequest(new URL(pathWithoutCountry + req.nextUrl.search, req.url), {
          headers: requestHeaders,
        })
      : new NextRequest(req.url, { headers: requestHeaders });

  let response = intlMiddleware(intlRequest);
  if (effectiveCountry === 'OM') {
    response = ensureOmanIntlRewrite(
      req,
      response,
      pathWithoutCountry,
      requestHeaders,
    );
  }
  response = applyOmanPrefixToIntlResponse(intlRequest, response, effectiveCountry);
  response = promoteDefaultLocaleRedirectToPermanent(intlRequest, response);
  response = applySecurityHeaders(response);

  response.cookies.set('user_country', effectiveCountry, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)']
};
