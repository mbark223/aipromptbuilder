"use client";

import { useCallback } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { CSRF_COOKIE_NAME } from "@/lib/auth/constants";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function normalizeError(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

async function ensureCsrfToken(): Promise<string> {
  let csrf = readCookie(CSRF_COOKIE_NAME);
  if (csrf) {
    return csrf;
  }

  await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
    headers: {
      "Accept": "application/json",
    },
  }).catch(() => undefined);

  csrf = readCookie(CSRF_COOKIE_NAME);
  if (csrf) {
    return csrf;
  }

  throw new Error("Unable to establish a secure session. Please refresh the page and try again.");
}

async function createSession(idToken: string, redirect: string) {
  const csrf = await ensureCsrfToken();

  const response = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRF-Token": csrf,
    },
    body: JSON.stringify({ idToken, redirect }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message ?? "Unable to establish session");
  }
}

function isCrossOriginIsolated() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean((window as Window & { crossOriginIsolated?: boolean }).crossOriginIsolated);
}

export function useFirebaseAuth() {
  const auth = getFirebaseAuth();

  const signInWithEmail = useCallback(
    async (email: string, password: string, redirect: string) => {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken(true);
        await createSession(idToken, redirect);
      } catch (error) {
        const code = (error as { code?: string }).code;
        const message =
          code === "auth/invalid-credential"
            ? "Invalid email or password"
            : code === "auth/too-many-requests"
            ? "Too many attempts. Please try again later."
            : normalizeError(error);
        throw new Error(message);
      }
    },
    [auth],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, redirect: string) => {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken(true);
        await createSession(idToken, redirect);
      } catch (error) {
        const code = (error as { code?: string }).code;
        const message =
          code === "auth/email-already-in-use"
            ? "An account with this email already exists"
            : code === "auth/weak-password"
            ? "Password must be at least 6 characters"
            : normalizeError(error);
        throw new Error(message);
      }
    },
    [auth],
  );

  const signInWithGoogle = useCallback(
    async (redirect: string) => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      if (isCrossOriginIsolated()) {
        await signInWithRedirect(auth, provider);
        return;
      }

      try {
        const credential = await signInWithPopup(auth, provider);
        const idToken = await credential.user.getIdToken(true);
        await createSession(idToken, redirect);
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code === "auth/popup-closed-by-user") {
          throw new Error("Sign-in canceled");
        }

        const shouldFallback =
          isCrossOriginIsolated() ||
          code === "auth/popup-blocked" ||
          code === "auth/cancelled-popup-request" ||
          code === "auth/operation-not-supported-in-this-environment";

        if (shouldFallback) {
          await signInWithRedirect(auth, provider);
          return;
        }

        const normalized = normalizeError(error);
        throw new Error(normalized);
      }
    },
    [auth],
  );

  const completeRedirectSignIn = useCallback(
    async (redirect: string): Promise<boolean> => {
      try {
        const result = await getRedirectResult(auth);
        if (!result || !result.user) {
          return false;
        }

        const idToken = await result.user.getIdToken(true);
        await createSession(idToken, redirect);
        return true;
      } catch (error) {
        throw new Error(normalizeError(error));
      }
    },
    [auth],
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } finally {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
    }
  }, [auth]);

  return {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    completeRedirectSignIn,
    logout,
  };
}
