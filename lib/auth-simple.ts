// Simplified auth configuration for debugging
export const GOOGLE_OAUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI || '',
  response_type: 'token',
  scope: 'email profile',
  access_type: 'online',
})}`;