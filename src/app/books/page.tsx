import BookCard from '@/app/books/_components/BookCard';
import { SectionHeading } from '@/components/SectionHeading';
import { getAllBooks, getChaptersByBook, NEW_BOOK_SLUGS } from '@/lib/books';
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
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { SITE_URL } from '@/lib/site';
import {
  BOOKS_OG_IMAGE,
  BOOKS_OG_IMAGE_HEIGHT,
  BOOKS_OG_IMAGE_WIDTH,
} from '@/lib/book-seo';



export const metadata: Metadata = {
  title: 'プログラミング教科書一覧｜無料で学べるWeb開発入門',
  description:
    'HTML・CSS・JavaScript・React・TypeScript・AWS・SQL・Git などのWeb開発教科書を無料で公開。章ごとに順番に読み進められ、クイズで理解度をチェックできます。初心者から実務経験者まで、基礎を体系的に学びたい方に最適です。',
  alternates: { canonical: '/books' },
  openGraph: {
    title: 'プログラミング教科書一覧｜無料で学べるWeb開発入門',
    description:
      'HTML・CSS・JavaScript・React・TypeScriptなどのWeb開発教科書を無料で公開。章ごとに順番に学べます。',
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/books`,
    images: [
      {
        url: BOOKS_OG_IMAGE,
        width: BOOKS_OG_IMAGE_WIDTH,
        height: BOOKS_OG_IMAGE_HEIGHT,
        alt: '鮮やかな色面の中で青い本を読む人物を描いた、ウェブエンジニア問題集の教科書機能キービジュアル',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プログラミング教科書一覧｜無料で学べるWeb開発入門',
    description:
      'HTML・CSS・JavaScript・React・TypeScriptなどのWeb開発教科書を無料で公開。章ごとに順番に学べます。',
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
    books: [
      'html-basics',
      'css-basics',
      'javascript',
      'tailwind-css',
      'typescript',
      'react-learning',
      'next-js',
    ],
  },
  {
    title: 'バックエンド開発',
    description: 'サーバーサイドの処理やデータベース操作を学ぶ',
    books: ['javascript', 'node-js', 'sql-basics', 'sqlite', 'http-and-web-api'],
  },
  {
    title: 'インフラ・設計',
    description: 'クラウドやシステム全体の設計を理解する',
    books: ['aws-saa-c03', 'system-design', 'http-and-web-api'],
  },
  {
    title: '開発基礎・品質',
    description: 'チーム開発やテスト、CS基礎など開発の土台を固める',
    books: ['git-basic', 'cs-basics', 'unit-testing', 'integration-and-e2e-testing'],
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
        'HTML・CSS・JavaScript・React・TypeScript・AWS・SQLなどのWeb開発教科書を無料で公開。章ごとに順番に学べます。',
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
          <div className="relative min-h-[360px] overflow-hidden border-b border-white/85 bg-cream-deep shadow-[0_28px_80px_rgba(47,48,47,0.12)] sm:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
            <Image
              src="/images/books-hero-editorial-human-v2.png"
              alt="鮮やかな色面の中で青い本を読む人物を中心にした教科書機能のキービジュアル"
              width={1200}
              height={630}
              priority
              className="absolute top-0 bottom-0 left-0 h-full w-full object-cover object-[64%_44%] sm:-translate-x-[3%] sm:scale-[1.04] sm:object-[50%_46%] lg:-translate-x-[5%] lg:scale-[1.08] xl:-translate-x-[4%] xl:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.98)_0%,rgba(255,250,244,0.9)_46%,rgba(255,250,244,0.52)_72%,rgba(255,250,244,0.12)_100%)] md:bg-[linear-gradient(90deg,rgba(255,250,244,0.98)_0%,rgba(255,250,244,0.92)_28%,rgba(255,250,244,0.46)_54%,rgba(255,250,244,0.1)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream to-transparent" />
            <div className="pointer-events-none absolute -left-7 top-[18%] hidden rotate-[-8deg] text-[7rem] font-black leading-none text-brand-blue/10 md:block">
              BOOK
            </div>
            <div className="relative z-10 flex min-h-[360px] flex-col items-start px-6 py-6 sm:min-h-[400px] sm:px-14 sm:py-10 md:px-24 lg:min-h-[500px] lg:px-28 xl:min-h-[600px] xl:px-32">
              <div className="flex items-start gap-3 sm:gap-5">
                <p className="mt-2 hidden text-lg font-black leading-none text-ink [writing-mode:vertical-rl] sm:block">
                  地図になる。
                </p>
                <div>
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-red/25 bg-white/80 px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-brand-red-deep shadow-[0_10px_30px_rgba(47,48,47,0.08)] sm:text-xs">
                    <span className="size-2 rounded-full bg-brand-lime" />
                    1章から、順番に学べる
                  </p>
                  <h1 className="flex flex-col font-display text-[2.5rem] font-black leading-[0.98] tracking-normal text-ink sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem]">
                    <span className="text-brand-red">迷わない、</span>
                    <span>腑に落ちる。</span>
                  </h1>
                  <p className="mt-3 w-fit -rotate-1 bg-brand-red px-3 py-1.5 text-base font-black leading-tight text-white shadow-[8px_8px_0_var(--color-brand-lime)] sm:mt-4 sm:px-4 sm:text-xl">
                    読む。わかる。身につく。
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-xl pr-12 text-base font-black leading-relaxed tracking-normal text-ink [&]:decoration-clone sm:text-xl">
                <span className="[background:linear-gradient(to_top,rgba(255,255,255,0.75)_40%,transparent_40%)] [box-decoration-break:clone]">
                  ウェブ開発の基礎を、章ごとに順番に学べる教科書。
                </span>
              </p>
              <div className="mt-5 inline-grid grid-cols-3 divide-x divide-ink/10 rounded-[0.2rem] border border-white/80 bg-white/90 shadow-[0_18px_50px_rgba(47,48,47,0.12)] backdrop-blur">
                <div className="flex min-w-[6.75rem] flex-col items-center justify-center px-3 py-2.5 sm:min-w-[7.5rem] sm:px-4">
                  <p className="text-2xl font-black leading-none text-brand-red sm:text-3xl">
                    {books.length}
                  </p>
                  <p className="mt-1 text-[10px] font-bold tracking-[0.08em] text-ink-body">冊</p>
                </div>
                <div className="flex min-w-[6.75rem] flex-col items-center justify-center px-3 py-2.5 sm:min-w-[7.5rem] sm:px-4">
                  <p className="text-2xl font-black leading-none text-ink sm:text-3xl">
                    {totalChapters}
                    <span className="text-sm font-bold text-ink-muted">+</span>
                  </p>
                  <p className="mt-1 text-[10px] font-bold tracking-[0.08em] text-ink-body">章</p>
                </div>
                <div className="flex min-w-[6.75rem] flex-col items-center justify-center px-3 py-2.5 sm:min-w-[7.5rem] sm:px-4">
                  <p className="text-2xl font-black leading-none text-brand-blue sm:text-3xl">
                    0円
                  </p>
                  <p className="mt-1 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                    すべて無料
                  </p>
                </div>
              </div>
              <div className="mt-auto flex max-w-[calc(100%-3rem)] flex-wrap gap-2 pt-8 text-xs font-black text-ink sm:text-sm">
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
                  chapterLabel: c.chapterLabel,
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
                <h2 className="font-display text-lg font-bold text-foreground mb-2">
                  ウェブエンジニア問題集の教科書とは
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  ウェブエンジニア問題集の教科書は、JavaScript・React・TypeScript・CSS・AWS・SQL・Gitなど、Web開発に必要な技術を体系的に学べる無料のオンライン技術書です。全
                  {books.length}冊・{totalChapters}
                  章以上のコンテンツを、会員登録不要で誰でも読めます。各章は「なぜそうなるのか」を掘り下げて解説しており、暗記ではなく理解を重視した構成になっています。
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
                  {books.length}
                  冊のうち10冊には対応するクイズカテゴリがあり、教科書でインプットした知識をクイズでアウトプットできます。「読んだだけ」で終わらず、理解度を確認しながら進められるので定着率が高まります。
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
            ].map((feature) => {
              return (
                <div
                  key={feature.title}
                  className="rounded-md bg-white border border-gray-100 shadow-sm p-4"
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
                  className="rounded-lg bg-white border border-gray-100 shadow-sm p-4 sm:p-5"
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
