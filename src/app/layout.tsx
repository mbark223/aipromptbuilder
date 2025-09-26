import "server-only";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import { AppLayout } from "./app-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Worthy Ad Builder",
  description: "Create professional video ads with AI-powered tools",
};

import { Toaster } from "@/components/ui/toaster";
import { getUserFromCookies } from "@/lib/auth/getUserFromCookies";

const PUBLIC_PATH_PREFIXES = ["/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATH_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const currentPath = headerList.get("next-url") ?? "/";

  if (!isPublicPath(currentPath)) {
    const user = await getUserFromCookies();
    if (!user) {
      redirect(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
