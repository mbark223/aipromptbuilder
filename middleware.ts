import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/auth/constants";
const PUBLIC_PATHS = ["/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
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
  if (!target) {
    return "/";
  }

  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/";
  }

  return target;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api") || isAssetPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isPublic = isPublicPath(pathname);

  if (pathname === "/auth") {
    const response = NextResponse.next();

    if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
      response.cookies.set({
        name: CSRF_COOKIE_NAME,
        value: crypto.randomUUID(),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 2 * 24 * 60 * 60,
      });
    }

    if (hasSession) {
      const targetPath = safeRedirect(
        request.nextUrl.searchParams.get("redirect"),
      );
      if (targetPath !== pathname) {
        return NextResponse.redirect(new URL(targetPath, request.url));
      }
    }

    return response;
  }

  if (!hasSession && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (hasSession && isPublic) {
    const targetPath = safeRedirect(request.nextUrl.searchParams.get("redirect"));
    if (targetPath !== pathname) {
      return NextResponse.redirect(new URL(targetPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(png|svg|jpg|jpeg|gif|webp|ico|txt)$).*)",
  ],
};
