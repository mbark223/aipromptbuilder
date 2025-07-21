import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">AI Prompt Builder v2</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/projects"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Projects
            </Link>
            <Link
              href="/templates"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Templates
            </Link>
            <Link
              href="/prompts"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Prompts
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="sm">
            Settings
          </Button>
          <Button size="sm">New Prompt</Button>
        </div>
      </div>
    </header>
  );
}