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

  console.log(`Auth Token:`, authToken ? "exists" : "missing");
  console.log(`Refresh Token:`, refreshToken ? "exists" : "missing");

  // If it's a protected path
  if (isProtectedPath) {
    // If no auth token but refresh token exists, try to refresh
    if (!authToken && refreshToken) {
      try {
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/refresh`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          // Token refreshed successfully, continue with request
          console.log("Token refreshed successfully in middleware");
          return NextResponse.next();
        } else {
          // Refresh failed, redirect to login
          console.log("Token refresh failed in middleware");
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("redirect", path);
          return NextResponse.redirect(loginUrl);
        }
      } catch (error) {
        console.error("Error refreshing token in middleware:", error);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(loginUrl);
      }
    }

    // If no tokens at all, redirect to login
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
