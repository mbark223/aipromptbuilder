"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export function AuthPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const router = useRouter();
  const { completeRedirectSignIn } = useFirebaseAuth();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const hasCsrf = document.cookie
        .split(";")
        .map((entry) => entry.trim().startsWith("fbCsrf="))
        .some(Boolean);

      if (!hasCsrf) {
        try {
          await fetch("/api/auth/csrf", { credentials: "include" });
        } catch {
          // Ignore; createSession will request again if needed
        }
      }

      try {
        const finished = await completeRedirectSignIn(redirect);
        if (finished && !cancelled) {
          router.replace(redirect);
        }
      } catch {
        // Swallow redirect completion errors; user can retry interactively
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [completeRedirectSignIn, redirect, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <div className="relative hidden w-full max-w-xl flex-col justify-center overflow-hidden bg-gradient-to-br from-neutral-100 via-white to-neutral-200 p-12 dark:from-[#0f1013] dark:via-[#101217] dark:to-[#151820] lg:flex">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/20" />
            <div className="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(21,23,30,0.7)_0%,rgba(15,16,19,0)_70%)]" />
          </div>
          <div className="relative z-10 space-y-8 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
                <Image src="/logo.png" width={36} height={36} alt="Worthy Ad Builder" className="h-9 w-9" />
              </div>
              <span className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                Worthy Ad Builder
              </span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-[2.75rem] dark:text-neutral-50">
                Launch winning creatives in minutes.
              </h1>
              <p className="max-w-sm text-lg text-neutral-600 dark:text-neutral-300">
                A focused workspace for building and shipping high-converting ads.
              </p>
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-neutral-400/40 via-neutral-500/70 to-neutral-400/40 dark:from-white/10 dark:via-white/40 dark:to-white/10" />
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              <span className="flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                ✨ Prompt → Video
              </span>
              <span className="flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                🎞️ Frames → Video
              </span>
              <span className="flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/70 px-3 py-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                🖼️ Static → Motion
              </span>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Image src="/logo.png" width={40} height={40} alt="Worthy Ad Builder" />
              <span className="text-xl font-semibold">Worthy Ad Builder</span>
            </div>
            <AuthCard redirect={redirect} />
          </div>
        </div>
      </div>
    </div>
  );
}
