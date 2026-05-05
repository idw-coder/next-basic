'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface Chapter {
  title: string;
  order: number;
  bookSlug: string;
  chapterSlug: string;
}

interface BookSidebarProps {
  bookTitle: string;
  bookSlug: string;
  chapters: Chapter[];
}

function SidebarContent({
  bookTitle,
  bookSlug,
  chapters,
  onNavigate,
}: BookSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col">
      <Link
        href={`/books/${bookSlug}`}
        className="mb-4 text-sm font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2"
        onClick={onNavigate}
      >
        {bookTitle}
      </Link>
      <ol className="flex flex-col gap-0.5">
        {chapters.map((chapter) => {
          const href = `/books/${bookSlug}/${chapter.chapterSlug}`;
          const isActive = pathname === href;
          return (
            <li key={chapter.chapterSlug}>
              <Link
                href={href}
                onClick={onNavigate}
                className={cn(
                  'flex items-start gap-2.5 rounded-xs px-2.5 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <span className="shrink-0 text-xs font-mono mt-0.5 text-gray-400 w-4 text-right">
                  {chapter.order}
                </span>
                <span className="line-clamp-2">{chapter.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BookSidebarDesktop(props: BookSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 pb-8">
        <SidebarContent {...props} />
      </div>
    </aside>
  );
}

export function BookSidebarMobile(props: BookSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors">
            <Menu className="h-5 w-5" />
            <span className="sr-only">目次を開く</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b">
            <SheetTitle className="text-sm">目次</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto p-4">
            <SidebarContent {...props} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
