import createMiddleware from 'next-intl/middleware';
import { localePath } from '@/features/blogs/lib/blog-routes';
import { routing } from './i18n/routing';
import type { Locale } from 'next-intl';
import {
  hasExplicitArabicLocalePrefix,
  promoteDefaultLocaleRedirectToPermanent,
  stripExplicitArabicLocalePrefix,
} from '@/lib/i18n-locale-redirect';
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

function isEnglishOmanIntlPath(pathWithoutCountry: string): boolean {
  return pathWithoutCountry === '/en' || pathWithoutCountry.startsWith('/en/');
}

/** Pins NEXT_LOCALE on the intl sub-request so `/om/*` stays Arabic unless `/en/om/*`. */
function withPinnedLocaleCookie(
  req: NextRequest,
  headers: Headers,
  locale: 'ar' | 'en',
): void {
  const parts = (req.headers.get('cookie') ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !part.startsWith('NEXT_LOCALE='));
  parts.push(`NEXT_LOCALE=${locale}`);
  headers.set('cookie', parts.join('; '));
}

function redirectExplicitArabicLocalePrefix(
  req: NextRequest,
  pathname: string,
  urlCountry: 'SA' | 'OM',
  pathWithoutCountry: string,
): NextResponse | null {
  const search = req.nextUrl.search;

  if (urlCountry === 'SA' && hasExplicitArabicLocalePrefix(pathname)) {
    const target = stripExplicitArabicLocalePrefix(pathname);
    return NextResponse.redirect(new URL(target + search, req.url), 301);
  }

  if (
    urlCountry === 'OM' &&
    hasExplicitArabicLocalePrefix(pathWithoutCountry)
  ) {
    const inner = stripExplicitArabicLocalePrefix(pathWithoutCountry);
    const target = withCountryPrefix('OM', inner);
    return NextResponse.redirect(new URL(target + search, req.url), 301);
  }

  return null;
}

function applyCountryToRedirectTarget(
  target: string,
  req: NextRequest,
  countryCode: 'SA' | 'OM',
): string {
  if (countryCode !== 'OM') return target;
  if (target.startsWith('http://') || target.startsWith('https://')) {
    const url = new URL(target);
    url.pathname = withCountryPrefix('OM', url.pathname);
    return url.toString();
  }
  const path = target.startsWith('/') ? target : `/${target}`;
  return withCountryPrefix('OM', path);
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
  originalReq: NextRequest,
  response: NextResponse,
  countryCode: 'SA' | 'OM',
): NextResponse {
  if (countryCode !== 'OM') return response;

  const location = response.headers.get('Location');
  if (!location) return response;

  const toUrl = new URL(location, originalReq.url);
  const prefixed = withCountryPrefix('OM', toUrl.pathname);
  if (prefixed === toUrl.pathname) return response;

  toUrl.pathname = prefixed;
  const status = response.status === 301 || response.status === 308 ? response.status : 301;
  const next = NextResponse.redirect(toUrl, status);

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

async function resolveConfiguredRedirect(
  req: NextRequest,
  pathname: string,
  countryCode: 'SA' | 'OM',
) {
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
      const resolvedTarget = applyCountryToRedirectTarget(target, req, countryCode);
      return NextResponse.redirect(new URL(resolvedTarget, req.url), status);
    }

    return null;
  } catch {
    return null;
  }
}

const STATIC_ASSET_RE =
  /^\/(?:favicon\.ico|robots\.txt|sitemap\.xml|manifest\.webmanifest|manifest\.json)$/i;

function isStaticAssetPath(pathname: string): boolean {
  if (STATIC_ASSET_RE.test(pathname)) return true;
  return /\.(?:ico|png|jpe?g|gif|webp|svg|woff2?|ttf|eot|css|js|map|txt|xml)$/i.test(
    pathname,
  );
}

export default async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  if (isStaticAssetPath(pathname)) {
    return applySecurityHeaders(NextResponse.next());
  }

  const { countryCode: urlCountry, pathname: pathWithoutCountry } = parseCountryPath(pathname);

  if (isLegacyOmanEnglishPath(pathname)) {
    const migrated = migrateLegacyOmanEnglishPath(pathname);
    const redirectUrl = new URL(migrated + req.nextUrl.search, req.url);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl, 301));
  }

  const explicitArRedirect = redirectExplicitArabicLocalePrefix(
    req,
    pathname,
    urlCountry,
    pathWithoutCountry,
  );
  if (explicitArRedirect) {
    return applySecurityHeaders(explicitArRedirect);
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

  const configuredRedirect = await resolveConfiguredRedirect(
    req,
    pathWithoutCountry,
    effectiveCountry,
  );
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

  if (effectiveCountry === 'OM') {
    withPinnedLocaleCookie(
      req,
      requestHeaders,
      isEnglishOmanIntlPath(pathWithoutCountry) ? 'en' : 'ar',
    );
  }

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
  response = applyOmanPrefixToIntlResponse(req, response, effectiveCountry);
  response = promoteDefaultLocaleRedirectToPermanent(req, response);
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
