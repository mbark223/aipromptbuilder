import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Check if the request is for protected routes
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/blendr") ||
    request.nextUrl.pathname.startsWith("/dashboard");
    
  if (isProtectedRoute && !token) {
    // Redirect to login page if not authenticated
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/blendr/:path*", "/dashboard/:path*"],
};