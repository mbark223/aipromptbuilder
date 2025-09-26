'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !pathname.startsWith('/auth');

  return (
    <div className={showSidebar ? 'flex min-h-screen' : 'min-h-screen'}>
      {showSidebar && <AppSidebar />}
      <main className={showSidebar ? 'flex-1' : 'min-h-screen w-full'}>
        {children}
      </main>
    </div>
  );
}
