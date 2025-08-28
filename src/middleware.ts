import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /login)
  const path = request.nextUrl.pathname;

  // Define paths that require authentication
  const protectedPaths = ["/dashboard"];

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  // Get auth tokens from cookies
  const authToken = request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // If it's a protected path
  if (isProtectedPath) {
    // CHANGED: If we have either token OR refresh token, allow access
    // Let the API client handle the refresh logic
    if (authToken || refreshToken) {
      // User has some form of authentication, let them through
      // API client will handle token refresh if needed
      return NextResponse.next();
    }

    // Only redirect to login if NO tokens at all
    if (!authToken && !refreshToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is authenticated and trying to access login page
  if (authToken && path === "/login") {
    // Get redirect URL from query params or default to dashboard
    const redirectUrl =
      request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};