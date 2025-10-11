// Use consistent cookie name across environments to avoid issues
// The secure flag is set separately based on environment
export const SESSION_COOKIE_NAME = "fbSession";

export const CSRF_COOKIE_NAME = "fbCsrf";

export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days
