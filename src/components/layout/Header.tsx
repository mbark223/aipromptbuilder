'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { useBrand } from '@/contexts/BrandContext';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();
  const { brandGuidelines } = useBrand();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">AI Prompt Builder</span>
          </Link>
          {brandGuidelines && (
            <Badge variant="secondary" className="ml-2">
              {brandGuidelines.name}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {session?.user && (
            <>
              <div className="flex items-center gap-2 mr-4">
                <User className="h-4 w-4" />
                <span className="text-sm">{session.user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}