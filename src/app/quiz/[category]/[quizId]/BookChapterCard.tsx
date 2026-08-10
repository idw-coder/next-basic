'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBookTheme } from '@/lib/book-theme';
import type { RelatedChapterLink } from '@/lib/quiz-book-links';

/**
 * クイズ解説内の教科書リンクをカード表示する。
 * データは Server Component 側（quiz-book-links.ts）で解決して受け取る。
 */
export default function BookChapterCard({
  link,
  className,
}: {
  link: Omit<RelatedChapterLink, 'matched'>;
  className?: string;
}) {
  const theme = getBookTheme(link.bookSlug);

  return (
    <Link
      href={link.href}
      className={cn(
        'group mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3.5 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-4',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-md',
          theme.iconBg,
          theme.iconText,
        )}
      >
        <BookOpen className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold text-muted-foreground">
          教科書で復習する
        </span>
        <span className="block truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-primary sm:text-[15px]">
          {link.chapterTitle}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
          <span className="truncate">{link.bookTitle}</span>
          <span className="inline-flex shrink-0 items-center gap-0.5">
            <Clock className="size-3" aria-hidden="true" />
            約{link.readingTime}分
          </span>
        </span>
        {link.anchorText && (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
            該当セクション: {link.anchorText}
          </span>
        )}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}
