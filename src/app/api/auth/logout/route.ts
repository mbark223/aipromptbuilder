import "server-only";

import { NextRequest, NextResponse } from "next/server";
import {
  getAdminAuth,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/auth", request.url);
  const response = NextResponse.redirect(redirectUrl);

  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (session && isFirebaseAdminConfigured()) {
    try {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifySessionCookie(session, true);
      await adminAuth.revokeRefreshTokens(decoded.uid);
    } catch (error) {
      // Ignore verification errors but still clear cookie
    }
  }

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
