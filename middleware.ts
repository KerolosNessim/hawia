import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/checkout'];
// Routes that should NOT be accessible if already authenticated
const authRoutes = ['/login', '/register'];

export default function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;

  // Extract the locale and the actual path
  // Example: /ar/login -> locale: ar, path: /login
  const pathParts = pathname.split('/');
  const locale = routing.locales.includes(pathParts[1]) ? pathParts[1] : '';
  const actualPath = locale ? `/${pathParts.slice(2).join('/')}` : pathname;

  const isProtectedRoute = protectedRoutes.some(route => actualPath.startsWith(route));
  const isAuthRoute = authRoutes.some(route => actualPath === route);

  // 1. If trying to access a protected route without a token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${locale || routing.defaultLocale}/login`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If trying to access login/register with a token
  if (isAuthRoute && token) {
    const homeUrl = new URL(`/${locale || routing.defaultLocale}`, req.url);
    return NextResponse.redirect(homeUrl);
  }

  // Fallback to intlMiddleware for localization
  const response = intlMiddleware(req);

  // Detect user country from headers (Cloudflare, Vercel, etc)
  // Note: On localhost, these headers are empty, so it defaults to 'EG'
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || 'EG';
  
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