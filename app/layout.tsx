import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthSessionProvider } from "@/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Media Ad Preview Tool",
  description: "Preview your ads across all major social platforms with safety zone validation. Ensure your creative works perfectly on Snapchat, Facebook, Reddit, TikTok, and Twitter.",
  keywords: ["social media", "ad preview", "creative", "marketing", "advertising", "safety zones"],
  authors: [{ name: "Ad Preview Tool" }],
  openGraph: {
    title: "Social Media Ad Preview Tool",
    description: "Preview your ads across all major social platforms with safety zone validation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}