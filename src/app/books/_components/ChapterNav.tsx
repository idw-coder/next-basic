import Link from 'next/link';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';

interface ChapterInfo {
  title: string;
  bookSlug: string;
  chapterSlug: string;
}

interface ChapterNavProps {
  prev: ChapterInfo | null;
  next: ChapterInfo | null;
  bookSlug?: string;
}

export function ChapterNav({ prev, next, bookSlug }: ChapterNavProps) {
  const tocSlug = bookSlug ?? prev?.bookSlug ?? next?.bookSlug;

  return (
    <nav className="mt-12 space-y-4 border-t border-gray-200 pt-8">
      <div className="flex flex-col sm:flex-row gap-3">
        {prev ? (
          <Link
            href={`/books/${prev.bookSlug}/${prev.chapterSlug}`}
            className="group flex flex-1 min-w-0 items-center gap-3 rounded-lg border border-gray-200 px-4 py-3.5 text-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 group-hover:bg-primary/10 transition-colors">
              <ChevronLeft className="size-4 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-gray-400">前の章</div>
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
            className="group flex flex-1 min-w-0 items-center justify-end gap-3 rounded-lg border border-gray-200 px-4 py-3.5 text-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm text-right"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-gray-400">次の章</div>
              <div className="font-medium text-gray-700 group-hover:text-primary transition-colors truncate">
                {next.title}
              </div>
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="size-4 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {tocSlug && (
        <div className="flex justify-center">
          <Link
            href={`/books/${tocSlug}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <List className="size-3.5" />
            目次に戻る
          </Link>
        </div>
      )}
    </nav>
  );
}
