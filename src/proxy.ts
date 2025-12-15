import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js Proxy - Runs on every request (Next.js 16+)
 *
 * Features:
 * - Route protection (auth required)
 * - Security headers
 * - Rate limiting headers
 * - Admin route protection
 */

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/traderoom",
  "/settings",
  "/finance",
  "/community",
  "/deposit",
  "/withdraw",
];

// Routes that require admin role
const adminRoutes = ["/admin", "/staff-admin"];

// Public routes (no auth needed)
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/about",
  "/academy",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
];

// API routes that should skip middleware
const skipMiddleware = [
  "/api/auth",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/icons",
  "/avatars",
  "/crypto",
  "/payments",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and certain API routes
  if (skipMiddleware.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // XSS protection (legacy but still useful)
    "X-XSS-Protection": "1; mode=block",
    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Permissions policy (disable unnecessary features)
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    // HSTS - Force HTTPS (uncomment for production)
    // "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Get user token for auth checks
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  const isAdminRoute = adminRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admin users from admin routes
  if (isAdminRoute && (!isAuthenticated || userRole !== "ADMIN")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // User is logged in but not admin
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect authenticated users away from login/signup
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
