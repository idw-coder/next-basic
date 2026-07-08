import type { Metadata } from 'next';
import Image from 'next/image';
import { BookOpenCheck, CheckCircle2, Layers3 } from 'lucide-react';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
import BookCard from '@/app/books/_components/BookCard';
import { SectionHeading } from '@/components/SectionHeading';

import { SITE_URL } from '@/lib/site';

const BOOKS_OG_IMAGE = `${SITE_URL}/images/books-hero-editorial2.png`;

export const metadata: Metadata = {
  title: '教科書一覧 | ウェブエンジニア問題集',
  description:
    'HTML・CSS・JavaScript・React・AWS など、ウェブ開発の基礎を章ごとに体系的に学べる無料の技術書コンテンツ。クイズと組み合わせて理解を深められます。',
  alternates: { canonical: '/books' },
  openGraph: {
    title: '教科書一覧 | ウェブエンジニア問題集',
    description: 'ウェブ開発の基礎を体系的に学べる無料の技術書コンテンツ',
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/books`,
    images: [
      {
        url: BOOKS_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: '理解を、整える。ウェブエンジニア問題集の教科書機能キービジュアル',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '教科書一覧 | ウェブエンジニア問題集',
    description: 'ウェブ開発の基礎を体系的に学べる無料の技術書コンテンツ',
    images: [BOOKS_OG_IMAGE],
  },
};

export default function BooksPage() {
  const books = getAllBooks();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '教科書一覧',
    description: 'ウェブ開発の基礎を体系的に学べる無料の技術書コンテンツ',
    url: `${SITE_URL}/books`,
    numberOfItems: books.length,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ウェブエンジニア問題集',
      url: SITE_URL,
    },
  };

  return (
    <div className="bg-[linear-gradient(180deg,#fff7ef_0%,#ffffff_42%,#fff7ef_100%)] text-[#232323]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ヒーロー */}
      <section className="relative overflow-hidden pb-8 md:pb-12">
        <div className="mx-auto">
          <h1 className="sr-only">教科書一覧</h1>
          <div className="relative overflow-hidden border-b border-white/85 bg-[#f7ede1] shadow-[0_28px_80px_rgba(47,48,47,0.12)]">
            <Image
              src="/images/books-hero-editorial2.png"
              alt="理解を、整える。ウェブエンジニア問題集の教科書機能キービジュアル"
              width={1200}
              height={630}
              priority
              className="h-auto w-full"
            />
          </div>

          <div className="mx-auto mt-4 flex max-w-6xl flex-wrap gap-2 px-4 md:mt-5">
            <div className="flex flex-wrap gap-2 text-xs font-black text-[#232323] sm:text-sm">
              {[
                { icon: BookOpenCheck, text: '基礎から順番に', color: 'text-[#0967c9]' },
                { icon: Layers3, text: '章ごとに整理', color: 'text-[#ff624d]' },
                { icon: CheckCircle2, text: 'クイズ前後の復習', color: 'text-emerald-600' },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-1.5 rounded-full border border-[#232323]/10 bg-[#fffaf1] px-3 py-1.5 shadow-[6px_6px_0_rgba(215,255,56,0.3)]"
                >
                  <item.icon className={`size-4 shrink-0 ${item.color}`} />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="book-list" className="mx-auto max-w-6xl px-4 pt-2 pb-10 md:pt-4 md:pb-14">
        <SectionHeading className="mb-7" subtitle={`${books.length}冊の教科書から選べます`}>
          教科書一覧
        </SectionHeading>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {books.map((book) => {
            const chapters = getChaptersByBook(book.bookSlug);
            return (
              <BookCard
                key={book.bookSlug}
                bookSlug={book.bookSlug}
                title={book.title}
                description={book.description}
                coverImage={book.coverImage}
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
    </div>
  );
}
