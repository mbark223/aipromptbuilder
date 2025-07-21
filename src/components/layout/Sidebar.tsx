'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'Prompts', href: '/prompts', icon: '✏️' },
  { name: 'Templates', href: '/templates', icon: '📋' },
  { name: 'Export', href: '/export', icon: '📤' },
];

const quickActions = [
  { name: 'New Prompt', action: 'new-prompt', icon: '➕' },
  { name: 'Import', action: 'import', icon: '📥' },
  { name: 'Batch Create', action: 'batch', icon: '📦' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'transparent'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <Separator />
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Quick Actions
          </h2>
          <div className="space-y-1">
            {quickActions.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Button>
            ))}
          </div>
        </div>
        <Separator />
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Recent Projects
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Holiday Campaign 2024
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Product Launch Videos
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              Social Media Ads Q4
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}