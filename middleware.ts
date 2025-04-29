import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Add routes that don't require authentication
const publicRoutes = ["/login", "/register", "/api/auth/session", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // Allow access to public routes and static files without auth check
  if (
    isPublicRoute ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // Get the session cookie
    const sessionCookie = request.cookies.get("lfap_session");

    if (!sessionCookie) {
      // No session cookie found, redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Make a request to the session API to verify authentication
    const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
      headers: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    });

    if (!sessionResponse.ok) {
      throw new Error("Failed to verify session");
    }

    const session = await sessionResponse.json();

    if (!session.isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // If there's any error verifying the session, redirect to login
    console.error("Error verifying session:", error);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure matcher for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (fonts, images, etc)
     */
    "/((?!api/auth|_next/static|_next/image|fonts|favicon.ico).*)",
  ],
};
