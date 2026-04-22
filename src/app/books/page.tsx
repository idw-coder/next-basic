import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { getAllBooks, getChaptersByBook } from "@/lib/books";

export const metadata: Metadata = {
  title: "Books | ウェブエンジニア問題集",
  description:
    "エンジニア初学者向けの技術書コンテンツ。体系的に基礎から学べます。",
};

// 書籍ごとのテーマ（ポップ感のための色セット）
interface BookTheme {
  cardBg: string;
  iconBg: string;
  iconText: string;
  accent: string;
  accentHover: string;
  badgeBg: string;
  badgeText: string;
}

const DEFAULT_THEME: BookTheme = {
  cardBg: "bg-amber-50",
  iconBg: "bg-amber-200",
  iconText: "text-amber-700",
  accent: "text-amber-700",
  accentHover: "group-hover:text-amber-700",
  badgeBg: "bg-white",
  badgeText: "text-amber-700",
};

const bookThemeMap: Record<string, BookTheme> = {
  "cs-basics": {
    cardBg: "bg-purple-100",
    iconBg: "bg-purple-200",
    iconText: "text-purple-700",
    accent: "text-purple-700",
    accentHover: "group-hover:text-purple-700",
    badgeBg: "bg-white",
    badgeText: "text-purple-700",
  },
  nextjs: {
    cardBg: "bg-zinc-100",
    iconBg: "bg-zinc-200",
    iconText: "text-zinc-800",
    accent: "text-zinc-800",
    accentHover: "group-hover:text-zinc-900",
    badgeBg: "bg-white",
    badgeText: "text-zinc-800",
  },
  git: {
    cardBg: "bg-rose-100",
    iconBg: "bg-rose-200",
    iconText: "text-rose-700",
    accent: "text-rose-700",
    accentHover: "group-hover:text-rose-700",
    badgeBg: "bg-white",
    badgeText: "text-rose-700",
  },
};

// NEW バッジ対象の書籍（手動管理）
const NEW_BOOK_SLUGS = new Set<string>(["cs-basics"]);

export default function BooksPage() {
  const books = getAllBooks();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* ヒーロー */}
      <section className="relative mb-10 md:mb-14 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-purple-50 border border-black/5 px-5 py-8 sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 -right-6 w-28 h-28 rounded-full bg-amber-200/50 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 left-1/4 w-32 h-32 rounded-full bg-purple-200/50 blur-2xl"
        />
        {/* 書籍イラスト: 右上に絶対配置して本文の幅を邪魔しない */}
        <Image
          src="/book_open_simple.png"
          alt=""
          width={752}
          height={520}
          priority
          className="pointer-events-none select-none absolute top-4 right-2 sm:top-6 sm:right-6 w-20 sm:w-36 md:w-44 h-auto -rotate-6 drop-shadow-md opacity-90"
        />
        <div className="relative max-w-[calc(100%-5rem)] sm:max-w-[calc(100%-10rem)] md:max-w-[calc(100%-12rem)]">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-bold mb-3">
            <Sparkles className="size-3.5" />
            Books
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-tight">
            <span className="block">駆け出しエンジニアのための</span>
            <span className="block mt-1 text-3xl sm:text-4xl md:text-5xl text-primary">
              教科書
            </span>
          </h1>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            体系的に学べる技術書コンテンツです。クイズの前に、まずはここでインプットしましょう。
          </p>
        </div>
      </section>

      {/* 書籍グリッド */}
      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
        {books.map((book) => {
          const chapters = getChaptersByBook(book.bookSlug);
          const theme = bookThemeMap[book.bookSlug] ?? DEFAULT_THEME;
          const isNew = NEW_BOOK_SLUGS.has(book.bookSlug);

          return (
            <Link
              key={book.bookSlug}
              href={`/books/${book.bookSlug}`}
              className={`group relative block overflow-hidden rounded-2xl border-2 border-black/5 ${theme.cardBg} p-5 sm:p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5`}
            >
              {/* 右上の装飾ドット */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-4 right-4 flex gap-1.5"
              >
                <span className="size-1.5 rounded-full bg-white/80" />
                <span className="size-1.5 rounded-full bg-white/80" />
                <span className="size-1.5 rounded-full bg-white/80" />
              </span>

              {/* NEW バッジ */}
              {isNew && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-red-500 text-white px-2.5 py-0.5 text-[10px] font-black tracking-wider shadow-sm animate-pulse">
                  <Sparkles className="size-3" />
                  NEW
                </span>
              )}

              <div className={`flex items-start gap-4 ${isNew ? "mt-4" : ""}`}>
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText} shadow-sm`}
                >
                  <BookOpen className="size-7" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    className={`text-lg sm:text-xl font-black leading-snug tracking-tight text-gray-900 ${theme.accentHover} transition-colors`}
                  >
                    {book.title}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-gray-700/90 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full ${theme.badgeBg} ${theme.badgeText} border border-black/5 px-2.5 py-0.5 text-[11px] font-bold`}
                    >
                      全{chapters.length}章
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${theme.accent}`}
                    >
                      読む
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
