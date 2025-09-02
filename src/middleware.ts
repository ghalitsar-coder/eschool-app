import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, decodeJwt } from "jose";

// Helper function to get JWT secret from environment
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return new TextEncoder().encode(secret);
};

// Helper function to decode JWT token using jose
async function decodeToken(token: string) {
  try {
    if (!token) return null;
    
    // Decode without verification (just to get payload)
    const decoded = decodeJwt(token);
    return decoded;
  } catch (e) {
    return null;
  }
}

// Helper function to verify JWT token
async function verifyToken(token: string) {
  try {
    if (!token) return null;
    
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

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
      
      // Check role-based access control
      if (authToken) {
        const decodedToken = await decodeToken(authToken);
        console.log(`THIS IS  ~ decodedToken:`, decodedToken)
        if (decodedToken && decodedToken.role) {
          const userRole = decodedToken.role;
          
          // Define role-based access rules
          const roleAccessRules: Record<string, string[]> = {
            "bendahara": ["/dashboard/kas", "/dashboard/profile"],
            "koordinator": ["/dashboard/attendance", "/dashboard/members", "/dashboard/profile"],
            "staff": ["/dashboard/eschool", "/dashboard/profile"],
            "siswa": ["/dashboard/profile"]
          };
          
          // Check if user has access to this path
          const allowedPaths = roleAccessRules[userRole] || ["/dashboard/profile"];
          const hasAccess = allowedPaths.some(allowedPath => 
            path.startsWith(allowedPath)
          );
          
          // Special case: staff can also access dashboard root
          if (userRole === "staff" && path === "/dashboard") {
            return NextResponse.redirect(new URL("/dashboard/eschool", request.url));
          }
          
          // Special case: bendahara can also access dashboard root
          if (userRole === "bendahara" && path === "/dashboard") {
            return NextResponse.redirect(new URL("/dashboard/kas", request.url));
          }
          
          // Special case: koordinator can also access dashboard root
          if (userRole === "koordinator" && path === "/dashboard") {
            return NextResponse.redirect(new URL("/dashboard/attendance", request.url));
          }
          
          // Special case: siswa can also access dashboard root
          if (userRole === "siswa" && path === "/dashboard") {
            return NextResponse.redirect(new URL("/dashboard/profile", request.url));
          }
          
          if (!hasAccess) {
            // Redirect to appropriate dashboard based on role
            if (userRole === "bendahara") {
              return NextResponse.redirect(new URL("/dashboard/kas", request.url));
            } else if (userRole === "koordinator") {
              return NextResponse.redirect(new URL("/dashboard/attendance", request.url));
            } else if (userRole === "staff") {
              return NextResponse.redirect(new URL("/dashboard/eschool", request.url));
            } else if (userRole === "siswa") {
              return NextResponse.redirect(new URL("/dashboard/profile", request.url));
            }
          }
        } else {
          // Invalid token, redirect to login
          const loginUrl = new URL("/login", request.url);
          loginUrl.searchParams.set("redirect", path);
          return NextResponse.redirect(loginUrl);
        }
      }
      
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
  if ((authToken || refreshToken) && path === "/login") {
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