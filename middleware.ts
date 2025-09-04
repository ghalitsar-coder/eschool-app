import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, decodeJwt } from "jose";
  // If user has valid authToken and trying to access login page
  if (authToken && path === "/login") {
    try {
      const decodedToken = await decodeToken(authToken);
      if (decodedToken) {
        console.log(`🔄 ~ Redirecting authenticated user from login to dashboard`);
        // Get redirect URL from query params or default to dashboard
        const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (error) {
      // Invalid token, clear it and let user access login
      console.log(`❌ ~ Invalid token on login page, clearing cookies`);
      const response = NextResponse.next();
      response.cookies.delete("token");
      response.cookies.delete("refresh_token");
      return response;
    }
  }n to get JWT secret from environment
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
  console.log(`🚀 ~ middleware.ts:43 ~ path:`, path)

  // Define paths that require authentication
  const protectedPaths = ["/dashboard"];

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  // Get auth tokens from cookies
  const authToken = request.cookies.get("token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log(`🔐 ~ authToken exists:`, !!authToken);
  console.log(`🔄 ~ refreshToken exists:`, !!refreshToken);

  // If it's a protected path
  if (isProtectedPath) {
    // If NO tokens at all, redirect to login
    if (!authToken && !refreshToken) {
      console.log(`❌ ~ No tokens, redirecting to login`);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // If we have authToken, verify it and check role-based access
    if (authToken) {
      try {
        const decodedToken = await decodeToken(authToken);
        console.log(`🎯 ~ decodedToken:`, decodedToken);
        
        if (decodedToken) {
          // Check for roles in the token payload
          // Laravel JWT might store roles differently - check for 'roles' array or single 'role'
          const userRoles = decodedToken.roles || (decodedToken.role ? [decodedToken.role] : []);
          const userRole = decodedToken.role || (userRoles.length > 0 ? userRoles[0] : null);
          
          console.log(`🎯 ~ userRoles:`, userRoles);
          console.log(`🎯 ~ userRole:`, userRole);
          
          if (userRole) {
            // Define role-based access rules
            const roleAccessRules: Record<string, string[]> = {
              "bendahara": ["/dashboard", "/dashboard/kas", "/dashboard/profile"],
              "koordinator": ["/dashboard", "/dashboard/attendance", "/dashboard/members", "/dashboard/profile"],
              "staff": ["/dashboard", "/dashboard/eschool", "/dashboard/profile"],
              "siswa": ["/dashboard", "/dashboard/profile"],
              "member": ["/dashboard", "/dashboard/profile"] // Added member role
            };
            
            // Check if user has access to this path
            const allowedPaths = roleAccessRules[userRole] || ["/dashboard/profile"];
            const hasAccess = allowedPaths.some((allowedPath: string) => 
              path.startsWith(allowedPath)
            );
            
            if (!hasAccess) {
              console.log(`🚫 ~ No access for role ${userRole} to ${path}, redirecting`);
              // Redirect to appropriate dashboard based on role
              if (userRole === "bendahara") {
                return NextResponse.redirect(new URL("/dashboard/kas", request.url));
              } else if (userRole === "koordinator") {
                return NextResponse.redirect(new URL("/dashboard/attendance", request.url));
              } else if (userRole === "staff") {
                return NextResponse.redirect(new URL("/dashboard/eschool", request.url));
              } else { // siswa, member, or others
                return NextResponse.redirect(new URL("/dashboard/profile", request.url));
              }
            }
          } else {
            console.log(`⚠️ ~ No role found in token, allowing access but logging`);
            // Allow access but log for debugging
          }
        } else {
          // Invalid token, clear cookies and redirect to login
          console.log(`❌ ~ Invalid token, clearing cookies and redirecting`);
          const response = NextResponse.redirect(new URL("/login", request.url));
          response.cookies.delete("token");
          response.cookies.delete("refresh_token");
          return response;
        }
      } catch (error) {
        console.log(`❌ ~ Token decode error:`, error);
        // Error decoding token, clear cookies and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        response.cookies.delete("refresh_token");
        return response;
      }
    }
    
    // If we only have refresh token, let it through (API client will handle refresh)
    console.log(`✅ ~ Allowing access with available tokens`);
    return NextResponse.next();
  }

  // If user has valid authToken and trying to access login page
  if (authToken && path === "/login") {
    try {
      const decodedToken = await decodeToken(authToken);
      if (decodedToken && decodedToken.role) {
        console.log(`� ~ Redirecting authenticated user from login to dashboard`);
        // Get redirect URL from query params or default to dashboard
        const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (error) {
      // Invalid token, clear it and let user access login
      console.log(`❌ ~ Invalid token on login page, clearing cookies`);
      const response = NextResponse.next();
      response.cookies.delete("token");
      response.cookies.delete("refresh_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
