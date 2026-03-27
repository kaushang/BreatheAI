/**
 * Middleware — Route Protection
 *
 * Protects authenticated routes by checking for the presence of a Firebase
 * session cookie (__session). The cookie is set server-side by the
 * /api/auth/session route after successful Firebase sign-in.
 *
 * Note: Next.js Middleware runs in the Edge Runtime, which is incompatible
 * with the Firebase Admin SDK. We only check cookie presence here for fast
 * redirects. Full cryptographic session verification is done per-request
 * inside API Route Handlers using Firebase Admin SDK.
 */

import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/forecast",
  "/ask",
  "/compare",
  "/trends",
  "/profile",
  "/alerts",
];

// Routes only for unauthenticated users
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  const isAuthenticated = !!sessionCookie;
  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
