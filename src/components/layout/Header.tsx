'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="Worthy Ad Builder" 
              width={28} 
              height={28}
              className="object-contain"
            />
            <span className="font-bold">Worthy Ad Builder</span>
          </Link>
        </div>
      </div>
    </header>
  );
}