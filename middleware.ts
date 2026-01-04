/**
 * Next.js Middleware
 * Protects routes that require authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/signup'];
const protectedRoutes = ['/subjects', '/assessment', '/roadmap', '/learn', '/feedback'];
const guestAllowedRoutes = ['/roadmap', '/learn', '/subjects', '/assessment']; // Routes guests can access

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('ailp_session');

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);
  const isGuestAllowedRoute = guestAllowedRoutes.some(route => pathname.startsWith(route));

  // Allow guest access to certain routes (client-side will check localStorage)
  // For now, we'll allow access and let the client handle guest mode
  // Only redirect if it's a strictly protected route (like /assessment/submit)
  if (isProtectedRoute && !sessionCookie && !isGuestAllowedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to login/signup pages even with a cookie
  // (The pages themselves will handle redirecting if user is authenticated)
  // This prevents redirect loops and allows users to log in even if they have an invalid cookie

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

