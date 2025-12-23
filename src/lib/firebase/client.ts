import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;

function assertClientEnv(config: Record<string, string | undefined>): asserts config is Record<string, string> {
  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      throw new Error(`Missing Firebase client env var: ${key}`);
    }
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
  };

  // Skip validation during build
  if (typeof window !== 'undefined') {
    assertClientEnv(config);
  }

  firebaseApp = getApps().length ? getApp() : initializeApp(config);
  return firebaseApp;
}

let authInitialized = false;

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  
  // Connect to Firebase Auth Emulator in development
  if (!authInitialized && process.env.NODE_ENV === 'development' && process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    try {
      connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
      authInitialized = true;
      console.log('Connected to Firebase Auth Emulator');
    } catch (error) {
      // Already connected, ignore
    }
  }
  
  return auth;
}
