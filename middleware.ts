import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "auth";
const PUBLIC_PATHS = ["/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function safeRedirect(target: string | null) {
  if (!target) return "/";

  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/";
  }

  return target;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || isAssetPath(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get(AUTH_COOKIE)?.value === "true";

  if (!isAuthenticated && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set(
      "redirect",
      `${pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && isPublicPath(pathname)) {
    const targetPath = safeRedirect(
      request.nextUrl.searchParams.get("redirect")
    );
    const destination = new URL(targetPath, request.url);
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(png|svg|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
