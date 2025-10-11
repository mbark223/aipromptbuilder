import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

type AdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

let cachedConfig: AdminConfig | null | undefined;
let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;

function normalizePrivateKey(rawKey: string) {
  let privateKey = rawKey;

  if (privateKey.startsWith("\"") && privateKey.endsWith("\"")) {
    privateKey = privateKey.slice(1, -1);
  }

  return privateKey.replace(/\\n/g, "\n");
}

function loadAdminConfig(): AdminConfig | null {
  if (cachedConfig !== undefined) {
    return cachedConfig;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    cachedConfig = null;
    return cachedConfig;
  }

  cachedConfig = {
    projectId,
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
  };

  return cachedConfig;
}

function getAdminConfigOrThrow(): AdminConfig {
  const config = loadAdminConfig();

  if (!config) {
    throw new Error(
      "Missing Firebase admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
    );
  }

  return config;
}

function initAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const config = getAdminConfigOrThrow();

  adminApp =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
    });

  return adminApp;
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(loadAdminConfig());
}

export function getAdminAuth(): Auth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  adminAuthInstance = getAuth(initAdminApp());
  return adminAuthInstance;
}
