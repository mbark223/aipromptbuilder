'use client';

import { Header } from '@/components/layout/Header';
import { AppSidebar } from '@/components/layout/AppSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 flex">
        <AppSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}