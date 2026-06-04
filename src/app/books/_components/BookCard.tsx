import Link from 'next/link';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { getBookTheme } from '@/lib/book-theme';

interface BookCardProps {
  bookSlug: string;
  title: string;
  description: string;
  chapterCount: number;
  isNew?: boolean;
}

// 教科書一覧・トップページ共通の書籍カード。
// スマホ2列 / PC3列のグリッドに収まるよう、縦並びでコンパクトに組んでいる。
export default function BookCard({
  bookSlug,
  title,
  description,
  chapterCount,
  isNew = false,
}: BookCardProps) {
  const theme = getBookTheme(bookSlug);

  return (
    <Link
      href={`/books/${bookSlug}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-md border-2 border-black/5 ${theme.cardBg} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      {/* NEW バッジ（右上） */}
      {isNew && (
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-sm animate-pulse">
          <Sparkles className="size-3" />
          NEW
        </span>
      )}

      {/* アイコン */}
      <div
        className={`flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-md ${theme.iconBg} ${theme.iconText} shadow-sm`}
      >
        <BookOpen className="size-5 sm:size-6" strokeWidth={2.5} />
      </div>

      {/* タイトル */}
      <h3
        className={`mt-3 line-clamp-2 text-sm sm:text-base font-black leading-snug tracking-tight text-gray-900 ${theme.accentHover} transition-colors`}
      >
        {title}
      </h3>

      {/* 説明（スマホでは非表示にして縦の長さを抑える） */}
      <p className="mt-1.5 hidden text-xs leading-relaxed text-gray-700/90 line-clamp-2 sm:block">
        {description}
      </p>

      {/* フッター（章数 + 読む）。mt-auto で高さの違うカードでも下端を揃える */}
      <div className="mt-auto flex items-center justify-between pt-3">
        <span
          className={`inline-flex items-center rounded-full ${theme.badgeBg} ${theme.badgeText} border border-black/5 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold`}
        >
          全{chapterCount}章
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-bold ${theme.accent}`}
        >
          読む
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
