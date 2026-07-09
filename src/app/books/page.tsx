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
  const heroFeatures = [
    { icon: BookOpenCheck, text: '基礎から順番に', color: 'text-[#0967c9]' },
    { icon: Layers3, text: '章ごとに整理', color: 'text-[#ff624d]' },
    { icon: CheckCircle2, text: 'クイズ前後の復習', color: 'text-emerald-600' },
  ];

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
          <div className="relative min-h-[460px] overflow-hidden border-b border-white/85 bg-[#f7ede1] shadow-[0_28px_80px_rgba(47,48,47,0.12)] sm:min-h-[540px] lg:min-h-[580px] xl:min-h-[600px]">
            <Image
              src="/images/books-hero-editorial-bg.png"
              alt="青い本を読む人物を中心にした教科書機能のキービジュアル"
              width={1200}
              height={630}
              priority
              className="absolute top-0 bottom-0 left-0 h-full w-full object-cover object-[76%_44%] sm:-translate-x-[3%] sm:scale-[1.04] sm:object-[50%_46%] lg:-translate-x-[5%] lg:scale-[1.08] xl:-translate-x-[4%] xl:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,247,239,0.96)_0%,rgba(255,247,239,0.9)_62%,rgba(255,247,239,0.26)_100%)] sm:bg-[linear-gradient(90deg,rgba(255,247,239,0.95)_0%,rgba(255,247,239,0.86)_32%,rgba(255,247,239,0.18)_60%,rgba(255,247,239,0)_100%)]" />
            <div className="absolute left-6 top-6 flex max-w-[92vw] flex-col items-start sm:left-14 sm:top-10 md:left-24 lg:left-28 xl:left-32">
              <div className="flex items-start gap-3 sm:gap-5">
                <p className="mt-2 hidden text-lg font-black leading-none text-[#232323] [writing-mode:vertical-rl] sm:block">
                  地図になる。
                </p>
                <div>
                  <p className="mb-3 max-w-[18rem] text-[0.68rem] font-black uppercase leading-relaxed tracking-normal text-[#232323]/75 sm:max-w-none sm:text-xs">
                    Textbooks for web engineers - {books.length} books
                  </p>
                  <h1 className="flex flex-col text-[4rem] font-black leading-[0.88] tracking-normal text-[#151515] sm:text-[5.5rem] md:text-[7rem] lg:text-[8.5rem]">
                    <span className="text-[#ff624d]">理解を、</span>
                    <span>整える。</span>
                  </h1>
                </div>
              </div>
              <p className="mt-6 max-w-[18rem] text-lg font-black leading-relaxed tracking-normal text-[#232323] sm:max-w-md sm:text-2xl">
                ウェブ開発の基礎を、章ごとに順番に学べる教科書。
              </p>
              <div className="mt-8 flex items-center gap-2">
                <span className="h-2 w-10 rounded-full bg-[#ff624d]" />
                <span className="h-2 w-10 rounded-full bg-[#0967c9]" />
                <span className="h-2 w-10 rounded-full bg-[#f7b523]" />
              </div>
            </div>
            <div className="absolute bottom-5 left-6 flex max-w-[calc(100%-3rem)] flex-wrap gap-2 text-xs font-black text-[#232323] sm:bottom-8 sm:left-14 sm:text-sm md:left-24 lg:left-28 xl:left-32">
              {heroFeatures.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-1.5 rounded-full border border-white/75 bg-[#fffaf1]/82 px-3 py-1.5 shadow-[0_12px_28px_rgba(47,48,47,0.08)] backdrop-blur-sm"
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
