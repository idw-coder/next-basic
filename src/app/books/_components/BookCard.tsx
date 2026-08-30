'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen, Sparkles, ArrowRight,
  Blocks, Braces, FileCode2, Atom, Paintbrush, Wind,
  Cpu, Globe, GitBranch, FlaskConical, Globe2, TestTube2, Database,
  Container, Server, Cloud, Hash, Bot,
  type LucideIcon,
} from 'lucide-react';
import { getBookTheme } from '@/lib/book-theme';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getChapterListLabel } from '@/lib/chapter-label';
import { getBookShortTitle } from '@/lib/book-title';

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Blocks, Braces, FileCode2, Atom, Paintbrush, Wind,
  Cpu, Globe, GitBranch, FlaskConical, Globe2, TestTube2, Database,
  Container, Server, Cloud, Hash, Bot,
};

interface ChapterLink {
  title: string;
  order: number;
  chapterLabel?: string;
  chapterSlug: string;
}

interface BookCardProps {
  bookSlug: string;
  title: string;
  description: string;
  coverImage?: string;
  chapterCount: number;
  chapters: ChapterLink[];
  isNew?: boolean;
  /** スマホで3列に並べる一覧用。表紙の下を説明文から短い書名に差し替え、余白を詰める。 */
  compact?: boolean;
}

export default function BookCard({
  bookSlug,
  title,
  description,
  coverImage,
  chapterCount,
  chapters,
  isNew = false,
  compact = false,
}: BookCardProps) {
  const theme = getBookTheme(bookSlug);
  const shortTitle = getBookShortTitle(title);
  const BgIcon = iconMap[theme.iconName] ?? BookOpen;
  const [showChapters, setShowChapters] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowChapters(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setShowChapters(false), 200);
  }, []);

  return (
    <div
      className="group relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={`/books/${bookSlug}`}
        className={cn(
          'relative flex flex-col rounded-xl bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border border-gray-100',
          // 3列だと書名が1行の本と2行の本が混ざるので、カードの下端を揃える
          compact ? 'h-full p-2 sm:p-4' : 'p-3 sm:p-4',
        )}
      >
        {/* 表紙 */}
        <div className="relative mx-auto w-full max-w-[8rem] sm:max-w-[9.5rem]">
          <div
            className={cn(
              'relative aspect-[7/10] overflow-hidden rounded-[0.35rem]',
              'shadow-[4px_4px_12px_rgba(0,0,0,0.12)]',
              theme.iconBg,
            )}
          >
            {/* 背表紙エフェクト */}
            <div className="absolute inset-y-0 left-0 z-20 w-[7%] bg-gradient-to-r from-black/20 via-white/15 to-transparent" />
            <div className="absolute inset-y-0 left-[7%] z-20 w-px bg-white/40" />
            <div className="absolute inset-y-0 right-0 z-20 w-[5%] bg-gradient-to-l from-black/8 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-20 h-[4%] bg-gradient-to-t from-black/12 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent" />

            {/* タイトル（表紙上部） */}
            <div className="absolute inset-x-[10%] top-[10%] z-10 text-center">
              <p className={cn(
                'text-[9px] font-bold leading-tight line-clamp-2 sm:text-[10px]',
                theme.iconText,
              )}>
                {shortTitle}
              </p>
            </div>

            {coverImage ? (
              <div className="absolute left-1/2 top-[52%] size-14 -translate-x-1/2 -translate-y-1/2 sm:size-18">
                <Image
                  src={coverImage}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            ) : (
              <BgIcon
                className={cn(
                  'absolute left-1/2 top-[52%] size-14 -translate-x-1/2 -translate-y-1/2 sm:size-18',
                  theme.iconText,
                )}
                strokeWidth={1.5}
              />
            )}

            <div className="absolute inset-x-[18%] bottom-[14%] h-1.5 rounded-full bg-current/20" />
            <div className="absolute inset-x-[24%] bottom-[9%] h-1 rounded-full bg-current/14" />

            {isNew && (
              <span className="absolute right-0 top-0 z-30 inline-flex items-center gap-0.5 rounded-bl-md bg-red-500 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-white sm:text-[9px]">
                <Sparkles className="size-2" />
                NEW
              </span>
            )}

            <span className={cn(
              'absolute left-1.5 bottom-1.5 z-30 rounded-full px-1.5 py-0.5 text-[8px] font-bold sm:text-[9px]',
              'bg-white/85 backdrop-blur-sm',
              theme.badgeText,
            )}>
              {chapterCount}章
            </span>
          </div>
        </div>

        {/* カード下部。compactのスマホ表示だけは、幅が狭く説明文が読めないので書名を出す */}
        {compact && (
          <p className="mt-1.5 line-clamp-2 text-[10px] font-bold leading-snug text-gray-700 sm:hidden">
            {shortTitle}
          </p>
        )}
        <p
          className={cn(
            'mt-2 line-clamp-2 text-[10px] leading-relaxed text-gray-500 sm:text-[11px]',
            compact && 'max-sm:hidden',
          )}
        >
          {description}
        </p>
      </Link>

      {/* ホバー時の目次ポップアップ（デスクトップのみ） */}
      {showChapters && chapters.length > 0 && (
        <div
          className={cn(
            'absolute z-50 w-72',
            'left-1/2 -translate-x-1/2 top-full mt-1',
            'rounded-xl border border-gray-200 bg-white shadow-2xl',
            'hidden sm:block',
          )}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="border-b border-gray-100 px-3.5 py-2.5">
            <p className="text-[11px] font-bold text-gray-900 line-clamp-1">{title}</p>
          </div>

          <div className="max-h-56 overflow-y-auto py-1.5">
            <ol className="flex flex-col">
              {chapters.map((ch) => (
                <li key={ch.chapterSlug}>
                  <Link
                    href={`/books/${bookSlug}/${ch.chapterSlug}`}
                    className="flex items-start gap-2 px-3.5 py-1.5 text-[11px] transition-colors hover:bg-gray-50"
                  >
                    <span className={cn('shrink-0 font-mono tabular-nums mt-px font-semibold', theme.accent)}>
                      {getChapterListLabel(ch)}
                    </span>
                    <span className="text-gray-600 line-clamp-1 hover:text-gray-900">
                      {ch.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t border-gray-100 px-3.5 py-2">
            <Link
              href={`/books/${bookSlug}`}
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-semibold',
                theme.accent,
                'hover:underline',
              )}
            >
              教科書を読む
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
