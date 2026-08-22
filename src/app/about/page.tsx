import { SectionHeading } from '@/components/SectionHeading';
import { getAllBooks, getChaptersByBook } from '@/lib/books';
import { SITE_URL } from '@/lib/site';
import {
  BookOpen,
  ChevronRight,
  CircleCheck,
  Cpu,
  ListChecks,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

const TITLE = 'このサイトについて — 無料で学べるWeb開発の問題集と教科書 | ウェブエンジニア問題集';
const DESCRIPTION =
  'ウェブエンジニア問題集は、HTML・CSS・JavaScript・React・Node.jsなどWeb開発の知識を4択クイズと教科書で学べる無料の学習サイトです。運営方針、コンテンツの作り方、使い方をまとめています。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/about`,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const FEATURES = [
  {
    icon: ListChecks,
    title: '4択クイズで手を動かす',
    body: 'カテゴリごとに問題を用意しています。解答するとその場で解説が出るので、読んで終わりにならずに理解を確かめられます。',
    href: '/#categories',
    linkLabel: 'カテゴリ一覧を見る',
  },
  {
    icon: BookOpen,
    title: '教科書で体系的に読む',
    body: '断片的な知識をつなぐための教科書を章立てで公開しています。1章から順番に読める構成で、章末から関連クイズへ移動できます。',
    href: '/books',
    linkLabel: '教科書一覧を見る',
  },
  {
    icon: RotateCcw,
    title: '間違えた問題だけ復習する',
    body: '解答履歴とブックマークはブラウザに保存され、間違えた問題だけを集めて解き直せます。苦手をそのままにしません。',
    href: '/quiz/review',
    linkLabel: '復習モードへ',
  },
  {
    icon: Search,
    title: '横断検索で探す',
    body: 'クイズと教科書の章をキーワードで一括検索できます。用語を調べたいときの入口としても使えます。',
    href: '/search',
    linkLabel: '検索する',
  },
];

const POLICIES = [
  {
    title: '仕様の一次情報にあたる',
    body: 'MDNやW3C、各フレームワークの公式ドキュメントを根拠に執筆し、参考リンクを章末に明記しています。伝聞や古い慣習をそのまま載せません。',
  },
  {
    title: '「なぜそうなるか」まで書く',
    body: '動く書き方の暗記ではなく、仕組みと判断基準を説明します。図と会話形式を使い、つまずきやすい箇所を分解して解説します。',
  },
  {
    title: '公開後も直し続ける',
    body: '仕様変更や誤りが見つかった章は随時更新します。執筆途中の章は「執筆中」と明示し、完成したものと区別しています。',
  },
  {
    title: '登録なしで全部読める',
    body: 'クイズも教科書もすべて無料で、ログインなしで利用できます。アカウントは学習記録を端末をまたいで残したい場合にだけ使います。',
  },
];

export default function AboutPage() {
  const books = getAllBooks();
  const publicChapterCount = books.reduce(
    (sum, book) =>
      sum + getChaptersByBook(book.bookSlug).filter((chapter) => !chapter.draft).length,
    0,
  );

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'ウェブエンジニア問題集について',
      description: DESCRIPTION,
      url: `${SITE_URL}/about`,
      inLanguage: 'ja',
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
        {
          '@type': 'ListItem',
          position: 2,
          name: 'このサイトについて',
          item: `${SITE_URL}/about`,
        },
      ],
    },
  ];

  return (
    <div className="bg-cream text-ink">
      {jsonLd.map((ld) => (
        <script
          key={ld['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        {/* パンくず */}
        <nav aria-label="パンくずリスト" className="mb-6 text-xs sm:text-sm">
          <ol className="flex flex-wrap items-center gap-1 text-ink-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-brand-blue">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li aria-current="page" className="text-ink">
              このサイトについて
            </li>
          </ol>
        </nav>

        <header className="mb-10 md:mb-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-red/25 bg-white/80 px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-brand-red-deep sm:text-xs">
            <Sparkles className="size-3" aria-hidden="true" />
            登録なし・全部無料
          </p>
          <h1 className="font-display text-[1.9rem] font-black leading-[1.1] tracking-normal text-ink sm:text-[2.5rem]">
            このサイトについて
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink-muted md:text-base md:leading-8">
            ウェブエンジニア問題集は、Web開発の知識を「4択クイズ」と「教科書」の2本立てで学べる無料の学習サイトです。
            HTML・CSS・JavaScriptといった基礎から、React・Node.js・SQL・Git・AWSまで、
            現場で必要になる範囲を横断して扱っています。
            現在は{books.length}冊の教科書（公開{publicChapterCount}章）とクイズを公開しています。
          </p>
        </header>

        <section className="mb-12 md:mb-16">
          <SectionHeading center={false} className="mb-5" subtitle="4つの入口から学べます">
            できること
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {FEATURES.map(({ icon: Icon, title, body, href, linkLabel }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-cream-line bg-white/92 p-5 shadow-[0_14px_40px_rgba(47,48,47,0.06)]"
              >
                <h3 className="mb-2 flex items-center gap-2 font-display text-base font-black text-ink">
                  <Icon className="size-4 shrink-0 text-brand-blue" aria-hidden="true" />
                  {title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-6 text-ink-muted">{body}</p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1 text-sm font-bold text-brand-blue hover:underline"
                >
                  {linkLabel}
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 md:mb-16">
          <SectionHeading
            center={false}
            className="mb-5"
            subtitle="コンテンツを作るときに守っていること"
          >
            編集方針
          </SectionHeading>
          <ul className="space-y-3">
            {POLICIES.map(({ title, body }) => (
              <li
                key={title}
                className="rounded-2xl border border-cream-line bg-white/92 p-5 shadow-[0_14px_40px_rgba(47,48,47,0.06)]"
              >
                <h3 className="mb-1.5 flex items-center gap-2 font-display text-base font-black text-ink">
                  <CircleCheck className="size-4 shrink-0 text-brand-blue" aria-hidden="true" />
                  {title}
                </h3>
                <p className="text-sm leading-6 text-ink-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 md:mb-16">
          <SectionHeading center={false} className="mb-5" subtitle="運営と連絡先">
            運営について
          </SectionHeading>
          <div className="rounded-2xl border border-cream-line bg-white/92 p-5 text-sm leading-7 text-ink-muted shadow-[0_14px_40px_rgba(47,48,47,0.06)] md:p-6">
            <p className="mb-4">
              Web開発の実務に携わる個人が、自分の学び直しを兼ねて運営しています。
              問題文・解説・教科書の執筆から、サイトの実装・運用まで一人で行っています。
              誤りのご指摘や扱ってほしいテーマの要望は、Xアカウント宛にお寄せください。
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-bold text-brand-blue">
              <a
                href="https://x.com/web_eng_quiz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                X（@web_eng_quiz）↗
              </a>
              <a
                href="https://github.com/idw-coder/express-mysql-docker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                GitHubリポジトリ ↗
              </a>
              <Link
                href="/about/tech?mode=entry"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Cpu className="size-4" aria-hidden="true" />
                技術構成を見る
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue-wash/90 p-6 text-center md:p-8">
            <p className="font-display text-lg font-black text-ink md:text-xl">
              まずは1問、解いてみてください
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              登録もインストールも不要です。今の実力を測るところから始められます。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/quiz/random"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                腕試しテストを始める
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:border-brand-blue hover:text-brand-blue"
              >
                教科書から読む
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
