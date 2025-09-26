import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth";

const baseCookie = {
  name: AUTH_COOKIE,
  value: "true",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function resolveRedirect(request: NextRequest) {
  const url = new URL(request.url);
  const redirect = url.searchParams.get("redirect") ?? "/";

  if (redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }

  return "/";
}

function attachAuthCookie(response: NextResponse) {
  response.cookies.set(baseCookie);
  return response;
}

export async function GET(request: NextRequest) {
  const redirectPath = resolveRedirect(request);
  const target = new URL(redirectPath, request.url);
  const response = NextResponse.redirect(target);
  return attachAuthCookie(response);
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json().catch(() => ({}));

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  if (email.trim().length === 0 || password.trim().length < 8) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true });
  return attachAuthCookie(response);
}
