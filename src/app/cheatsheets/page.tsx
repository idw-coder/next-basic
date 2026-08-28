import { ArrowRight, BookOpen, NotebookTabs, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { getBookTheme } from '@/lib/book-theme';
import { getBook, getChapter } from '@/lib/books';
import { SITE_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'プログラミングチートシート一覧｜目的からすぐ引ける早見表',
  description:
    'HTML文字参照、JavaScript、正規表現、Docker、Git、GitHub Actions、Zod、AIエージェント開発のチートシートをまとめています。構文やコマンドを目的別に素早く確認できます。',
  alternates: { canonical: '/cheatsheets' },
  openGraph: {
    title: 'プログラミングチートシート一覧',
    description: 'Web開発の構文・コマンド・設定を目的別にすぐ引けるチートシート集です。',
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/cheatsheets`,
  },
};

const CHEATSHEET_SHORTCUTS = [
  {
    label: 'HTMLエンティティ',
    summary: '&lt;・&amp;・&nbsp;',
    bookSlug: 'html-basics',
    chapterSlug: 'html-cheatsheet',
    anchor: 'html-entities',
  },
  {
    label: '配列メソッド',
    summary: 'map・filter・reduce',
    bookSlug: 'javascript',
    chapterSlug: '07-arrays',
    anchor: 'cheatsheet',
  },
  {
    label: '制御文字',
    summary: '\\n・\\t・\\r・\\0',
    bookSlug: 'javascript',
    chapterSlug: '08-string-methods',
    anchor: 'control-characters',
  },
  {
    label: '正規表現',
    summary: '記号・フラグ・実例',
    bookSlug: 'javascript',
    chapterSlug: '08-string-methods',
    anchor: 'よく使うパターン部品',
  },
  {
    label: 'Zod',
    summary: 'スキーマ・メソッド',
    bookSlug: 'zod',
    chapterSlug: 'cheatsheet',
  },
  {
    label: 'Gitコマンド',
    summary: 'add・commit・push',
    bookSlug: 'git-basic',
    chapterSlug: '11-cheatsheet',
  },
  {
    label: 'Dockerコマンド',
    summary: 'pull・run・ps・stop',
    bookSlug: 'docker',
    chapterSlug: 'image-and-container-basics',
  },
  {
    label: 'GitHub Actions',
    summary: 'トリガー・式・ジョブ',
    bookSlug: 'github-actions',
    chapterSlug: '12-cheatsheet',
  },
  {
    label: 'AIエージェント',
    summary: '指示・設定・権限',
    bookSlug: 'ai-agent-development',
    chapterSlug: 'cheatsheet',
  },
] as const;

export default function CheatsheetsPage() {
  const items = CHEATSHEET_SHORTCUTS.flatMap((shortcut) => {
    const book = getBook(shortcut.bookSlug);
    const chapter = getChapter(shortcut.bookSlug, shortcut.chapterSlug);
    if (!book || !chapter || chapter.draft) return [];

    const href = `/books/${shortcut.bookSlug}/${shortcut.chapterSlug}${
      'anchor' in shortcut ? `#${encodeURIComponent(shortcut.anchor)}` : ''
    }`;

    return [{ ...shortcut, book, href }];
  });

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'プログラミングチートシート一覧',
      description: 'Web開発の構文・コマンド・設定を目的別に確認できるチートシート集です。',
      url: `${SITE_URL}/cheatsheets`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          url: `${SITE_URL}${item.href}`,
        })),
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
          name: 'チートシート',
          item: `${SITE_URL}/cheatsheets`,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--color-cream-deep)_0%,#ffffff_38%,var(--color-cream)_100%)] text-ink">
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="border-b border-cream-line bg-cream-deep/70 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-brand-blue"
          >
            <BookOpen className="size-4" />
            教科書一覧
          </Link>
          <div className="mt-6 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white/75 px-3 py-1 text-xs font-black text-brand-blue shadow-sm">
              <Sparkles className="size-3.5" />
              必要なところだけ、すぐ引ける
            </p>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              チートシート
            </h1>
            <p className="mt-4 text-base font-bold leading-8 text-ink-body sm:text-lg">
              構文やコマンドを忘れたときに、目的から素早く確認できる早見表をまとめました。
              詳しい理由を知りたくなったら、そのまま各教科書の解説へ進めます。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.12em] text-brand-red">QUICK REFERENCE</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">チートシート一覧</h2>
          </div>
          <p className="shrink-0 text-sm font-bold text-ink-muted">全{items.length}件</p>
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const { book } = item;
            const theme = getBookTheme(book.bookSlug);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'group relative flex min-h-[6.5rem] items-center gap-3 overflow-hidden rounded-2xl border border-ink/10 p-3 shadow-[0_8px_20px_rgba(35,35,35,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(35,35,35,0.11)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue sm:min-h-36 sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-[18px] sm:p-4 sm:shadow-[0_10px_25px_rgba(35,35,35,0.06)]',
                  theme.cardBg,
                )}
              >
                <span
                  className={cn(
                    'relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/80 shadow-sm sm:size-11',
                    theme.iconBg,
                  )}
                >
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    <NotebookTabs className={cn('size-5', theme.iconText)} strokeWidth={1.8} />
                  )}
                </span>
                <ArrowRight className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-blue sm:right-4 sm:top-4 sm:translate-y-0" />

                <div className="min-w-0 pr-7 sm:mt-auto sm:pr-0 sm:pt-4">
                  <h2 className="text-lg font-black leading-tight text-ink transition-colors group-hover:text-brand-blue sm:text-xl">
                    {item.label}
                  </h2>
                  <p className={cn('mt-1 text-xs font-bold sm:text-sm', theme.accent)}>
                    {item.summary}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
