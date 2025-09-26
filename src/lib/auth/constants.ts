export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Secure-fbSession" : "fbSession";

export const CSRF_COOKIE_NAME = "fbCsrf";

export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
