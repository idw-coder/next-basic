import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, CheckCircle2, Layers3 } from 'lucide-react';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
import BookCard from '@/app/books/_components/BookCard';
import { SectionHeading } from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://web-mondai.com';

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
    <div className="bg-[#fbf2e9] text-[#2f302f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ヒーロー */}
      <section className="relative overflow-hidden px-4 pt-8 pb-10 md:pt-16 md:pb-16">
        <Image
          src="/images/creative_color.png"
          alt=""
          width={738}
          height={452}
          priority
          className="pointer-events-none absolute left-1/2 top-4 hidden w-[52rem] max-w-none -translate-x-1/2 rotate-[15deg] opacity-[0.06] blur-[2px] saturate-75 lg:block"
        />
        <div className="relative mx-auto grid max-w-6xl gap-6 md:gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative z-10 text-center lg:text-left">
            <p className="mb-3 inline-flex rounded-full border border-[#2f86c9]/30 bg-white/70 px-3 py-1 text-[11px] font-bold text-[#2f86c9] sm:text-xs">
              短い章で、基礎から順番に
            </p>
            <h1 className="text-3xl font-black leading-tight tracking-normal text-[#242424] sm:text-5xl md:text-6xl">
              <span className="block text-[#df796b]">教科書で</span>
              <span className="block">理解を整える</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#56514c] sm:mt-5 sm:text-base sm:leading-8 lg:mx-0">
              クイズで曖昧だったところを、章ごとの読み物で確認できます。手を動かす前の地図として使える技術書コンテンツです。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-[#2f302f] sm:text-sm lg:justify-start">
              {[
                { icon: BookOpenCheck, text: '基礎から順番に', color: 'text-[#2f86c9]' },
                { icon: Layers3, text: '章ごとに整理', color: 'text-[#df796b]' },
                { icon: CheckCircle2, text: 'クイズ前後の復習', color: 'text-emerald-600' },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-1.5 rounded-full border border-[#2f302f]/15 bg-white/80 px-3 py-1.5 shadow-sm"
                >
                  <item.icon className={`size-4 shrink-0 ${item.color}`} />
                  {item.text}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button className="rounded-full bg-[#2f86c9] px-7 font-bold hover:bg-[#2476b4]" asChild>
                <Link href="#book-list" className="inline-flex items-center gap-2">
                  教科書を選ぶ
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto h-44 w-full max-w-sm sm:h-64 sm:max-w-xl md:h-80">
            <div className="absolute right-0 top-4 h-[68%] w-[72%] rounded-[2.25rem] border-2 border-[#2f302f]/70 bg-[#f3c875] sm:top-0 sm:rounded-[2.75rem]">
              <Image
                src="/images/stepup_suit_man_color-1.png"
                alt="段階的に学習を進める人のイラスト"
                width={690}
                height={763}
                priority
                className="absolute -bottom-2 left-1/2 h-[116%] w-auto -translate-x-1/2 object-contain sm:-bottom-4 sm:h-[122%]"
              />
            </div>
            <div className="absolute bottom-6 left-0 h-[48%] w-[48%] rounded-[1.5rem] border-2 border-[#2f302f]/70 bg-[#bde9ec] sm:bottom-8 sm:rounded-[2rem]">
              <Image
                src="/images/readingbook_woman_color.png"
                alt="教科書を読む人のイラスト"
                width={400}
                height={400}
                priority
                className="absolute -bottom-3 left-1/2 h-[118%] w-auto -translate-x-1/2 object-contain sm:-bottom-5"
              />
            </div>
          </div>
        </div>
      </section>

      <div id="book-list" className="mx-auto max-w-6xl px-4 pt-6 pb-10 md:pt-8 md:pb-14">
        <section className="rounded-[2rem] bg-white px-5 py-8 md:px-10 md:py-12">
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
        </section>
      </div>
    </div>
  );
}
