import "server-only";

import { cookies } from "next/headers";
import {
  getAdminAuth,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function getUserFromCookies() {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return null;
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded;
  } catch (error) {
    console.error("[auth] Failed to verify session cookie", error);
    return null;
  }
}
