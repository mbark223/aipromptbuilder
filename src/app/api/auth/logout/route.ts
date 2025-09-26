import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "auth";

export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/auth", request.url);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    expires: new Date(0),
    path: "/",
  });
  return response;
}
