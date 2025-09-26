import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Secure-fbSession" : "fbSession";

export async function getUserFromCookies() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return decoded;
  } catch (error) {
    return null;
  }
}
