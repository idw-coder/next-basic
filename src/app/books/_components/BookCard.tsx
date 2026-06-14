'use client';

import Link from 'next/link';
import {
  BookOpen, Sparkles, ArrowRight,
  Blocks, Braces, FileCode2, Atom, Paintbrush, Wind,
  Cpu, Globe, GitBranch, FlaskConical, Globe2, TestTube2,
  type LucideIcon,
} from 'lucide-react';
import { getBookTheme } from '@/lib/book-theme';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Blocks, Braces, FileCode2, Atom, Paintbrush, Wind,
  Cpu, Globe, GitBranch, FlaskConical, Globe2, TestTube2,
};

interface ChapterLink {
  title: string;
  order: number;
  chapterSlug: string;
}

interface BookCardProps {
  bookSlug: string;
  title: string;
  description: string;
  chapterCount: number;
  chapters: ChapterLink[];
  isNew?: boolean;
}

export default function BookCard({
  bookSlug,
  title,
  description,
  chapterCount,
  chapters,
  isNew = false,
}: BookCardProps) {
  const theme = getBookTheme(bookSlug);
  const [showChapters, setShowChapters] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowChapters(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setShowChapters(false), 150);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={`/books/${bookSlug}`}
        className={cn(
          'relative flex h-full flex-col rounded-lg bg-white p-5 sm:p-6',
          'border border-gray-200 shadow-sm overflow-hidden',
          'transition-all duration-200',
          'hover:shadow-md hover:border-gray-300',
        )}
      >
        {/* 背景の装飾アイコン */}
        {(() => {
          const BgIcon = iconMap[theme.iconName] ?? BookOpen;
          return (
            <BgIcon
              className={cn(
                'pointer-events-none absolute -right-4 -bottom-4 size-28 sm:size-32 opacity-[0.06]',
                theme.iconText,
              )}
              strokeWidth={1}
            />
          );
        })()}

        {/* ヘッダー: アイコン + NEW */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              theme.iconBg,
              theme.iconText,
            )}
          >
            {(() => { const Icon = iconMap[theme.iconName] ?? BookOpen; return <Icon className="size-4.5" strokeWidth={2} />; })()}
          </div>
          {isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">
              <Sparkles className="size-2.5" />
              NEW
            </span>
          )}
        </div>

        {/* タイトル */}
        <h3 className="text-[15px] sm:text-base font-bold leading-snug text-gray-900 line-clamp-2 mb-2">
          {title}
        </h3>

        {/* 説明 */}
        <p className="text-xs leading-relaxed text-gray-500 line-clamp-3 mb-4 hidden sm:block">
          {description}
        </p>

        {/* フッター */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
            theme.badgeBg,
            theme.badgeText,
          )}>
            全{chapterCount}章
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold',
              theme.accent,
            )}
          >
            読む
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      {/* ホバー時のチャプタープレビュー */}
      {showChapters && chapters.length > 0 && (
        <div
          className={cn(
            'absolute left-0 right-0 top-full z-30 -mt-1',
            'rounded-lg border border-gray-200 bg-white shadow-xl',
            'animate-in fade-in slide-in-from-top-1 duration-150',
          )}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="max-h-64 overflow-y-auto p-2">
            <ol className="flex flex-col">
              {chapters.map((ch) => (
                <li key={ch.chapterSlug}>
                  <Link
                    href={`/books/${bookSlug}/${ch.chapterSlug}`}
                    className="flex items-start gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-gray-50"
                  >
                    <span className={cn('shrink-0 font-mono tabular-nums mt-px', theme.accent)}>
                      {String(ch.order).padStart(2, '0')}
                    </span>
                    <span className="text-gray-700 line-clamp-1 group-hover/item:text-gray-900">
                      {ch.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div className="border-t border-gray-100 px-3 py-2">
            <Link
              href={`/books/${bookSlug}`}
              className={cn('text-[11px] font-semibold', theme.accent, 'hover:underline')}
            >
              教科書トップへ →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
