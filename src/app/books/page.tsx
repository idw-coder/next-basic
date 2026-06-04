import type { Metadata } from 'next';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
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
      <section className="relative mb-10 md:mb-14 overflow-hidden rounded-sm border border-black/5 px-5 py-8 sm:px-8 sm:py-10">
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
            <span className="block mt-2 text-3xl sm:text-4xl md:text-5xl text-primary">教科書</span>
          </h1>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            体系的に学べる技術書コンテンツです。クイズの前に、まずはここでインプットしましょう。
          </p>
        </div>
      </section>

      {/* 書籍グリッド: スマホ2列 / PC3列 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard
            key={book.bookSlug}
            bookSlug={book.bookSlug}
            title={book.title}
            description={book.description}
            chapterCount={getChaptersByBook(book.bookSlug).length}
            isNew={NEW_BOOK_SLUGS.has(book.bookSlug)}
          />
        ))}
      </div>
    </div>
  );
}
