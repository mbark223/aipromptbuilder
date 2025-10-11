import "server-only";

import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerList = await headers();
  const nextUrl = headerList.get("next-url") ?? "/";

  const user = await getUserFromCookies();
  if (!user) {
    redirect(`/auth?redirect=${encodeURIComponent(nextUrl)}`);
  }

  return <>{children}</>;
}
