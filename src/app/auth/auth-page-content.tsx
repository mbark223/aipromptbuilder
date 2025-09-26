"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";

export function AuthPageContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <div className="relative hidden w-full max-w-xl flex-col justify-center overflow-hidden bg-neutral-100 p-12 dark:bg-neutral-900 lg:flex">
          <div className="absolute inset-0 pointer-events-none [background:radial-gradient(600px_circle_at_20%_20%,rgba(0,0,0,0.05),transparent_40%),radial-gradient(600px_circle_at_80%_80%,rgba(0,0,0,0.05),transparent_40%)] dark:[background:radial-gradient(600px_circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%),radial-gradient(600px_circle_at_80%_80%,rgba(255,255,255,0.05),transparent_40%)]" />
          <div className="relative z-10 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" width={48} height={48} alt="Worthy Ad Builder" />
              <span className="text-2xl font-semibold">Worthy Ad Builder</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Create better ads, faster.
            </h1>
            <p className="text-base text-muted-foreground">
              AI-native workflows for concepting, consistency, and export—built for teams that move at the speed of culture.
            </p>
            <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <span>✨ Prompt → Video</span>
              <span>🎞️ Frames → Video</span>
              <span>🖼️ Static → Motion</span>
              <span>📦 Batch Export</span>
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
