import createMiddleware from 'next-intl/middleware';
import { localePath } from '@/features/blogs/lib/blog-routes';
import { routing } from './i18n/routing';
import type { Locale } from 'next-intl';
import { applySecurityHeaders } from '@/lib/security-headers';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/checkout'];
// Routes that should NOT be accessible if already authenticated
const authRoutes = ['/login', '/register'];

function resolveSupportedCountry(value: string | undefined): 'SA' | 'OM' {
  const normalized = value?.trim().toUpperCase();
  return normalized === 'OM' ? 'OM' : 'SA';
}

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  // Extract locale prefix and path without locale (supports localePrefix: 'as-needed')
  const pathParts = pathname.split('/');
  const localeSegment = pathParts[1];
  const hasLocalePrefix = routing.locales.includes(localeSegment as Locale);
  const currentLocale = (hasLocalePrefix ? localeSegment : routing.defaultLocale) as Locale;
  const actualPath = hasLocalePrefix
    ? `/${pathParts.slice(2).join('/')}` || '/'
    : pathname;

  const isProtectedRoute = protectedRoutes.some(route => actualPath.startsWith(route));
  const isAuthRoute = authRoutes.some(route => actualPath === route);

  // 1. If trying to access a protected route without a token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL(localePath(currentLocale, '/login'), req.url);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // 2. If trying to access login/register with a token
  if (isAuthRoute && token) {
    const homeUrl = new URL(localePath(currentLocale, '/'), req.url);
    return applySecurityHeaders(NextResponse.redirect(homeUrl));
  }

  // Fallback to intlMiddleware for localization
  const response = applySecurityHeaders(intlMiddleware(req));

  // Detect user country from headers (Cloudflare, Vercel, etc).
  // On localhost those headers are empty, so preserve an existing cookie for QA.
  const detectedCountry =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.cookies.get('user_country')?.value ||
    'SA';
  const country = resolveSupportedCountry(detectedCountry);
  
  // Set the country as a cookie so it can be easily accessed on client and server
  response.cookies.set('user_country', country, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return response;
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_static (static files)
  // - /favicon.ico, etc. (static files)
  matcher: ['/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)']
};
