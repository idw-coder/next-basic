import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Layers3,
  Lightbulb,
  Sparkles,
  Target,
} from 'lucide-react';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
import BookCard from '@/app/books/_components/BookCard';
import { SectionHeading } from '@/components/SectionHeading';
import { TriBar } from '@/components/TriBar';

import { SITE_URL } from '@/lib/site';

const BOOKS_OG_IMAGE = `${SITE_URL}/images/books-hero-editorial2.png`;

export const metadata: Metadata = {
  title: 'プログラミング教科書一覧 — 無料で学べるWeb開発入門 | ウェブエンジニア問題集',
  description:
    'JavaScript・React・TypeScript・CSS・AWS・SQL・Git など15冊のWeb開発教科書を無料で公開。章ごとに順番に読み進められ、クイズで理解度をチェックできます。初心者から実務経験者まで、基礎を体系的に学びたい方に最適です。',
  alternates: { canonical: '/books' },
  openGraph: {
    title: 'プログラミング教科書一覧 — 無料で学べるWeb開発入門 | ウェブエンジニア問題集',
    description:
      'JavaScript・React・TypeScriptなど15冊のWeb開発教科書を無料で公開。章ごとに順番に学べます。',
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
    title: 'プログラミング教科書一覧 — 無料で学べるWeb開発入門 | ウェブエンジニア問題集',
    description:
      'JavaScript・React・TypeScriptなど15冊のWeb開発教科書を無料で公開。章ごとに順番に学べます。',
    images: [BOOKS_OG_IMAGE],
  },
};

interface BookListFaq {
  question: string;
  answer: string;
}

const FAQS: BookListFaq[] = [
  {
    question: '教科書は本当にすべて無料ですか？',
    answer:
      'はい、すべての教科書を無料で読めます。会員登録なしでもアクセスできます。今後もコアコンテンツは無料で提供し続ける方針です。',
  },
  {
    question: 'プログラミング未経験ですが、どの教科書から始めればいいですか？',
    answer:
      'Web開発に興味がある方は「JavaScript入門」から始めるのがおすすめです。HTMLの基礎知識があればスムーズに読めます。CSSを先に学びたい場合は「CSS入門」から始めても構いません。',
  },
  {
    question: 'クイズと教科書はどう使い分ければいいですか？',
    answer:
      '教科書で知識をインプットし、対応するクイズでアウトプット（理解度チェック）するのが効果的です。10冊の教科書には対応するクイズカテゴリがあり、ページ内からワンクリックで移動できます。',
  },
  {
    question: '教科書の内容は最新ですか？',
    answer:
      '各教科書は定期的に内容を見直し、最新の仕様やベストプラクティスを反映しています。特にReact・Next.js・TypeScriptなど変化の早い技術は、メジャーアップデートに合わせて更新しています。',
  },
  {
    question: 'スマートフォンでも読めますか？',
    answer:
      'はい、すべての教科書はスマートフォン・タブレット・PCに対応したレスポンシブデザインです。通勤中やスキマ時間にも学習を進められます。',
  },
];

const LEARNING_PATHS = [
  {
    title: 'フロントエンド開発',
    description: 'Webサイトの見た目と操作性を作る技術を基礎から学ぶ',
    books: ['javascript', 'css-basics', 'tailwind-css', 'typescript', 'react-learning', 'next-js'],
    color: 'border-l-red-400',
  },
  {
    title: 'バックエンド開発',
    description: 'サーバーサイドの処理やデータベース操作を学ぶ',
    books: ['javascript', 'node-js', 'sql-basics', 'http-and-web-api'],
    color: 'border-l-blue-400',
  },
  {
    title: 'インフラ・設計',
    description: 'クラウドやシステム全体の設計を理解する',
    books: ['aws-saa-c03', 'system-design', 'http-and-web-api'],
    color: 'border-l-amber-400',
  },
  {
    title: '開発基礎・品質',
    description: 'チーム開発やテスト、CS基礎など開発の土台を固める',
    books: ['git-basic', 'cs-basics', 'unit-testing', 'integration-and-e2e-testing'],
    color: 'border-l-green-400',
  },
];

export default function BooksPage() {
  const books = getAllBooks();
  const heroFeatures = [
    { icon: BookOpenCheck, text: '基礎から順番に', color: 'text-brand-blue' },
    { icon: Layers3, text: '章ごとに整理', color: 'text-brand-red' },
    { icon: CheckCircle2, text: 'クイズ前後の復習', color: 'text-emerald-600' },
  ];

  const totalChapters = books.reduce(
    (sum, book) => sum + getChaptersByBook(book.bookSlug).length,
    0,
  );

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'プログラミング教科書一覧',
      description:
        'JavaScript・React・TypeScript・CSS・AWS・SQLなど15冊のWeb開発教科書を無料で公開。章ごとに順番に学べます。',
      url: `${SITE_URL}/books`,
      numberOfItems: books.length,
      isPartOf: {
        '@type': 'WebSite',
        name: 'ウェブエンジニア問題集',
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '教科書一覧', item: `${SITE_URL}/books` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];

  return (
    <div className="bg-[linear-gradient(180deg,var(--color-cream)_0%,#ffffff_42%,var(--color-cream)_100%)] text-ink">
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      {/* ヒーロー */}
      <section className="relative overflow-hidden pb-8 md:pb-12">
        <div className="mx-auto">
          <div className="relative min-h-[460px] overflow-hidden border-b border-white/85 bg-cream-deep shadow-[0_28px_80px_rgba(47,48,47,0.12)] sm:min-h-[540px] lg:min-h-[580px] xl:min-h-[600px]">
            <Image
              src="/images/books-hero-editorial-bg.png"
              alt="青い本を読む人物を中心にした教科書機能のキービジュアル"
              width={1200}
              height={630}
              priority
              className="absolute top-0 bottom-0 left-0 h-full w-full object-cover object-[76%_44%] sm:-translate-x-[3%] sm:scale-[1.04] sm:object-[50%_46%] lg:-translate-x-[5%] lg:scale-[1.08] xl:-translate-x-[4%] xl:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.96)_0%,rgba(255,250,244,0.9)_62%,rgba(255,250,244,0.26)_100%)] sm:bg-[linear-gradient(90deg,rgba(255,250,244,0.95)_0%,rgba(255,250,244,0.86)_32%,rgba(255,250,244,0.18)_60%,rgba(255,250,244,0)_100%)]" />
            <div className="absolute left-6 top-6 flex max-w-[92vw] flex-col items-start sm:left-14 sm:top-10 md:left-24 lg:left-28 xl:left-32">
              <div className="flex items-start gap-3 sm:gap-5">
                <p className="mt-2 hidden text-lg font-black leading-none text-ink [writing-mode:vertical-rl] sm:block">
                  地図になる。
                </p>
                <div>
                  <p className="mb-3 max-w-[18rem] text-[0.68rem] font-black uppercase leading-relaxed tracking-normal text-ink/75 sm:max-w-none sm:text-xs">
                    Textbooks for web engineers - {books.length} books
                  </p>
                  <h1 className="flex flex-col text-[4rem] font-black leading-[0.88] tracking-normal text-ink sm:text-[5.5rem] md:text-[7rem] lg:text-[8.5rem]">
                    <span className="text-brand-red">理解を、</span>
                    <span>整える。</span>
                  </h1>
                </div>
              </div>
              <p className="mt-6 max-w-[18rem] text-lg font-black leading-relaxed tracking-normal text-ink sm:max-w-md sm:text-2xl">
                ウェブ開発の基礎を、章ごとに順番に学べる教科書。
              </p>
              <TriBar size="lg" className="mt-8" />
            </div>
            <div className="absolute bottom-5 left-6 flex max-w-[calc(100%-3rem)] flex-wrap gap-2 text-xs font-black text-ink sm:bottom-8 sm:left-14 sm:text-sm md:left-24 lg:left-28 xl:left-32">
              {heroFeatures.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-1.5 rounded-full border border-white/75 bg-cream-soft/82 px-3 py-1.5 shadow-[0_12px_28px_rgba(47,48,47,0.08)] backdrop-blur-sm"
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

        {/* サイト概要 */}
        <section className="mt-14">
          <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.03] to-transparent p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  ウェブエンジニア問題集の教科書とは
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  ウェブエンジニア問題集の教科書は、JavaScript・React・TypeScript・CSS・AWS・SQL・Gitなど、Web開発に必要な技術を体系的に学べる無料のオンライン技術書です。全{books.length}冊・{totalChapters}章以上のコンテンツを、会員登録不要で誰でも読めます。各章は「なぜそうなるのか」を掘り下げて解説しており、暗記ではなく理解を重視した構成になっています。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  教科書 × クイズで学習効果を最大化
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {books.length}冊のうち10冊には対応するクイズカテゴリがあり、教科書でインプットした知識をクイズでアウトプットできます。「読んだだけ」で終わらず、理解度を確認しながら進められるので定着率が高まります。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴 */}
        <section className="mt-12">
          <SectionHeading
            size="sm"
            center={false}
            className="mb-5"
            icon={<Sparkles className="size-5 text-primary" />}
          >
            この教科書シリーズの特徴
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'すべて無料で読める',
                description:
                  '全冊・全章を無料で公開。会員登録なしでもアクセスでき、広告も表示しません。',
              },
              {
                title: '章ごとに体系的に整理',
                description:
                  '基礎から順番に読み進められる構成。必要な章だけ拾い読みしても使えます。',
              },
              {
                title: 'クイズで理解度チェック',
                description:
                  '10冊の教科書に対応するクイズカテゴリを用意。学んだ内容をすぐにテストできます。',
              },
              {
                title: '実務目線の解説',
                description:
                  '「なぜそうなるのか」を重視した解説で、暗記ではなく本質を理解できます。',
              },
              {
                title: 'スマホ対応',
                description:
                  'レスポンシブデザインで、スマートフォン・タブレット・PCどれでも快適に読めます。',
              },
              {
                title: '定期的に更新',
                description:
                  '最新の仕様やベストプラクティスを反映し、内容を定期的に見直しています。',
              },
            ].map((feature, i) => {
              const borderColors = [
                'border-l-red-400',
                'border-l-blue-400',
                'border-l-amber-400',
                'border-l-green-400',
                'border-l-purple-400',
                'border-l-cyan-400',
              ];
              return (
                <div
                  key={feature.title}
                  className={`rounded-md bg-white border border-gray-100 shadow-sm border-l-[5px] ${borderColors[i % borderColors.length]} p-4`}
                >
                  <h3 className="text-sm font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 学習パス */}
        <section className="mt-12">
          <SectionHeading
            size="sm"
            center={false}
            className="mb-5"
            icon={<BookOpenCheck className="size-5 text-primary" />}
          >
            目的別の学習パス
          </SectionHeading>
          <div className="space-y-4">
            {LEARNING_PATHS.map((path) => {
              const pathBooks = path.books
                .map((slug) => books.find((b) => b.bookSlug === slug))
                .filter(Boolean);
              return (
                <div
                  key={path.title}
                  className={`rounded-lg bg-white border border-gray-100 shadow-sm border-l-[5px] ${path.color} p-4 sm:p-5`}
                >
                  <h3 className="text-sm font-bold text-foreground sm:text-base">{path.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{path.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {pathBooks.map((book) => (
                      <Link
                        key={book!.bookSlug}
                        href={`/books/${book!.bookSlug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      >
                        {book!.title.replace(/入門.*|の基礎.*|基本.*/, '').trim() || book!.title}
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <SectionHeading
            size="sm"
            center={false}
            className="mb-5"
            icon={<HelpCircle className="size-5 text-primary" />}
          >
            よくある質問
          </SectionHeading>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-gray-100 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  {faq.question}
                </summary>
                <div className="px-4 pb-4 pl-11 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
