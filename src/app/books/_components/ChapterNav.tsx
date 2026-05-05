import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChapterInfo {
  title: string;
  bookSlug: string;
  chapterSlug: string;
}

interface ChapterNavProps {
  prev: ChapterInfo | null;
  next: ChapterInfo | null;
}

export function ChapterNav({ prev, next }: ChapterNavProps) {
  return (
    <nav className="mt-12 flex flex-col sm:flex-row gap-3 border-t border-gray-200 pt-8">
      {prev ? (
        <Link
          href={`/books/${prev.bookSlug}/${prev.chapterSlug}`}
          className="group flex flex-1 items-center gap-2 rounded-md border border-gray-200 px-4 py-3 text-sm transition hover:border-primary/30 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-primary transition-colors" />
          <div className="min-w-0">
            <div className="text-xs text-gray-500">前の章</div>
            <div className="font-medium text-gray-700 group-hover:text-primary transition-colors truncate">
              {prev.title}
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/books/${next.bookSlug}/${next.chapterSlug}`}
          className="group flex flex-1 items-center justify-end gap-2 rounded-md border border-gray-200 px-4 py-3 text-sm transition hover:border-primary/30 hover:bg-gray-50 text-right"
        >
          <div className="min-w-0">
            <div className="text-xs text-gray-500">次の章</div>
            <div className="font-medium text-gray-700 group-hover:text-primary transition-colors truncate">
              {next.title}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-primary transition-colors" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
