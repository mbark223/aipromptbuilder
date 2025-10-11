import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME } from "@/lib/auth/constants";

function createCsrfCookie() {
  return {
    name: CSRF_COOKIE_NAME,
    value: crypto.randomUUID(),
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 2 * 24 * 60 * 60,
  };
}

export async function GET(request: NextRequest) {
  const response = new NextResponse(
    JSON.stringify({ ok: true, token: request.cookies.get(CSRF_COOKIE_NAME)?.value ?? null }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );

  if (!request.cookies.get(CSRF_COOKIE_NAME)?.value) {
    response.cookies.set(createCsrfCookie());
  }

  return response;
}
