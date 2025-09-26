import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/auth/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeRedirect(target: unknown) {
  const redirect = typeof target === "string" ? target : "/";

  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/";
  }

  return redirect;
}

function jsonResponse(status: number, body: unknown) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function setSessionCookie(response: NextResponse, value: string, expiresInMs: number) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(expiresInMs / 1000),
  });
}

function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function POST(request: NextRequest) {
  const xhr = request.headers.get("X-Requested-With");
  const csrfHeader = request.headers.get("X-CSRF-Token");
  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (xhr !== "XMLHttpRequest" || !csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return jsonResponse(400, { message: "Invalid CSRF" });
  }

  let idToken: string | undefined;
  let redirect: string | undefined;

  try {
    const data = await request.json();
    idToken = data?.idToken;
    redirect = data?.redirect;
  } catch (error) {
    return jsonResponse(400, { message: "Invalid JSON" });
  }

  if (!idToken) {
    return jsonResponse(400, { message: "Missing idToken" });
  }

  try {
    await adminAuth.verifyIdToken(idToken, true);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_MS,
    });

    const response = jsonResponse(200, { ok: true, redirect: safeRedirect(redirect) });
    setSessionCookie(response, sessionCookie, SESSION_MAX_AGE_MS);
    return response;
  } catch (error) {
    return jsonResponse(401, { message: "Invalid credentials" });
  }
}

export async function DELETE(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const response = jsonResponse(200, { ok: true });

  if (!session) {
    clearSessionCookie(response);
    return response;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    await adminAuth.revokeRefreshTokens(decoded.uid);
  } catch (error) {
    // Ignore verification errors, still clear the cookie
  }

  clearSessionCookie(response);
  return response;
}
