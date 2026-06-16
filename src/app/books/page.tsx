import type { Metadata } from 'next';
import Image from 'next/image';
import { BookOpenCheck, CheckCircle2, Layers3, Sparkles } from 'lucide-react';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
import BookCard from '@/app/books/_components/BookCard';

export const metadata: Metadata = {
  title: 'Books | ウェブエンジニア問題集',
  description: 'エンジニア初学者向けの技術書コンテンツ。体系的に基礎から学べます。',
};

export default function BooksPage() {
  const books = getAllBooks();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* ヒーロー */}
      <section className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 px-4 py-5 shadow-sm sm:px-8 sm:py-9 md:mb-14 md:px-10 md:py-11">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-cyan-500 to-amber-300" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />

        <div className="relative sm:grid sm:items-center sm:gap-4 sm:grid-cols-[minmax(0,1fr)_220px] md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200 md:mb-4">
              <Sparkles className="size-3.5" />
              Books
            </div>

            <h1 className="text-2xl font-black leading-tight tracking-normal text-slate-950 sm:text-3xl md:text-4xl">
              <span className="block whitespace-nowrap sm:hidden">エンジニア初学者向け</span>
              <span className="hidden sm:block">駆け出しエンジニアのための</span>
              <span className="mt-1 block text-4xl text-primary sm:mt-2 sm:text-5xl md:text-6xl">教科書</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 md:mt-4">
              体系的に学べる技術書コンテンツです。クイズの前に、まずはここでインプットしましょう。
            </p>

            <div className="mt-4 flex max-w-[calc(100%-7rem)] flex-wrap gap-2 text-xs font-semibold text-slate-700 sm:mt-6 sm:grid sm:max-w-none sm:grid-cols-3 sm:text-sm">
              <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-2.5 py-1.5 shadow-sm sm:gap-2 sm:rounded-md sm:px-3 sm:py-2">
                <BookOpenCheck className="size-4 shrink-0 text-primary" />
                基礎から順番に
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-2.5 py-1.5 shadow-sm sm:gap-2 sm:rounded-md sm:px-3 sm:py-2">
                <Layers3 className="size-4 shrink-0 text-cyan-600" />
                章ごとに整理
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-2.5 py-1.5 shadow-sm sm:gap-2 sm:rounded-md sm:px-3 sm:py-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                クイズ前の復習
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 flex items-end justify-center sm:relative sm:bottom-auto sm:right-auto sm:mx-auto sm:h-full sm:min-h-36 sm:w-full sm:max-w-[260px] sm:self-end md:max-w-none">
            <div className="absolute bottom-0 h-24 w-28 rounded-t-lg bg-cyan-100 sm:h-36 sm:w-52 md:h-52 md:w-72" />
            <Image
              src="/images/readingbook_woman_color.png"
              alt=""
              width={721}
              height={766}
              priority
              className="relative h-auto w-28 drop-shadow-lg sm:w-48 md:w-72"
            />
            <Image
              src="/book_open_simple.png"
              alt=""
              width={751}
              height={512}
              className="pointer-events-none absolute right-1 top-0 hidden w-20 -rotate-6 opacity-90 drop-shadow-md sm:block md:-right-2 md:w-28"
            />
          </div>
        </div>
      </section>

      {/* 書籍グリッド: スマホ2列 / PC3列 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {books.map((book) => {
          const chapters = getChaptersByBook(book.bookSlug);
          return (
            <BookCard
              key={book.bookSlug}
              bookSlug={book.bookSlug}
              title={book.title}
              description={book.description}
              chapterCount={chapters.length}
              chapters={chapters.map((c) => ({
                title: c.title,
                order: c.order,
                chapterSlug: c.chapterSlug,
              }))}
              isNew={NEW_BOOK_SLUGS.has(book.bookSlug)}
            />
          );
        })}
      </div>
    </div>
  );
}
