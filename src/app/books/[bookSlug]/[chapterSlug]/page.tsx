import type { Metadata } from 'next';
import type { ComponentProps } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock } from 'lucide-react';
import {
  getBook,
  getChapter,
  getAdjacentChapters,
  getChaptersByBook,
  getAllBooks,
} from '@/lib/books';
import { MDXContent } from '@/components/mdx-content';
import QuizLink from '../../_components/QuizLink';
import { buildChapterOriginParam } from '@/lib/quizOrigin';
import { ChapterNav } from '../../_components/ChapterNav';
import { ChapterTocDesktop, ChapterTocMobile } from '../../_components/TableOfContents';
import { getChapterLabel } from '@/lib/chapter-label';

import { SITE_URL } from '@/lib/site';
import {
  BOOKS_OG_IMAGE,
  BOOKS_OG_IMAGE_ALT,
  BOOKS_OG_IMAGE_HEIGHT,
  BOOKS_OG_IMAGE_WIDTH,
  SITE_PUBLISHER,
  buildChapterTitle,
  getBookShortTitle,
} from '@/lib/book-seo';

export function generateStaticParams() {
  return getAllBooks().flatMap((book) =>
    getChaptersByBook(book.bookSlug).map((chapter) => ({
      bookSlug: book.bookSlug,
      chapterSlug: chapter.chapterSlug,
    })),
  );
}

interface ChapterPageProps {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { bookSlug, chapterSlug } = await params;
  const book = getBook(bookSlug);
  const chapter = getChapter(bookSlug, chapterSlug);
  if (!book || !chapter) return {};
  // 検索結果で切れない長さに詰めたタイトル。ページ内のH1（chapter.title）は変えない
  const title = buildChapterTitle(chapter.title, bookSlug, book.title);
  const description = chapter.description ?? book.description;
  const url = `${SITE_URL}/books/${bookSlug}/${chapterSlug}`;
  return {
    title,
    description,
    alternates: { canonical: `/books/${bookSlug}/${chapterSlug}` },
    // 執筆中の章はthin contentなのでインデックスさせない（リンクは辿らせる）
    robots: chapter.draft ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      locale: 'ja_JP',
      siteName: 'ウェブエンジニア問題集',
      modifiedTime: chapter.updated,
      images: [
        {
          url: BOOKS_OG_IMAGE,
          width: BOOKS_OG_IMAGE_WIDTH,
          height: BOOKS_OG_IMAGE_HEIGHT,
          alt: BOOKS_OG_IMAGE_ALT,
        },
      ],
    },
    // ルートlayoutのtwitterはサイト全体の文言なので、章ページでは章の文言に差し替える
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [BOOKS_OG_IMAGE],
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { bookSlug, chapterSlug } = await params;
  const book = getBook(bookSlug);
  const chapter = getChapter(bookSlug, chapterSlug);
  if (!chapter || !book) notFound();

  const { prev, next } = getAdjacentChapters(bookSlug, chapterSlug);

  const chapterUrl = `${SITE_URL}/books/${bookSlug}/${chapterSlug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: chapter.title,
      description: chapter.description ?? book.description,
      inLanguage: 'ja',
      url: chapterUrl,
      // Search Consoleの「記事」レポートが推奨するフィールド。
      // datePublished は初出日を保持していない（veliteが持つのは更新日時のみ）ため、
      // 推測値を入れずに省略している。
      mainEntityOfPage: { '@type': 'WebPage', '@id': chapterUrl },
      dateModified: chapter.updated,
      image: [BOOKS_OG_IMAGE],
      author: SITE_PUBLISHER,
      publisher: SITE_PUBLISHER,
      isAccessibleForFree: true,
      timeRequired: `PT${chapter.readingTime}M`,
      isPartOf: {
        '@type': 'Book',
        name: book.title,
        url: `${SITE_URL}/books/${bookSlug}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      // 本ページ側のパンくずと階層を揃える（ホームを起点にする）
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '教科書', item: `${SITE_URL}/books` },
        {
          '@type': 'ListItem',
          position: 3,
          // 画面のパンくずと表記を揃える（フルタイトルは検索結果のパンくずでも切れる）
          name: getBookShortTitle(bookSlug, book.title),
          item: `${SITE_URL}/books/${bookSlug}`,
        },
        { '@type': 'ListItem', position: 4, name: chapter.title, item: chapterUrl },
      ],
    },
  ];

  return (
    <article>
      {!chapter.draft && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* パンくず */}
      <nav aria-label="パンくずリスト" className="mb-6 text-xs sm:text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
          </li>
          <li><ChevronRight className="size-3" /></li>
          <li>
            <Link href="/books" className="hover:text-foreground transition-colors">
              教科書
            </Link>
          </li>
          <li><ChevronRight className="size-3" /></li>
          <li>
            {/* 本のフルタイトルは長く、truncateで「HTML入門 — Webページの構…」と切れて
                どの本かわかりにくかったため、短縮名を出す */}
            <Link
              href={`/books/${bookSlug}`}
              className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[200px] inline-block align-bottom"
            >
              {getBookShortTitle(bookSlug, book.title)}
            </Link>
          </li>
          <li><ChevronRight className="size-3" /></li>
          <li className="text-foreground font-medium truncate max-w-[140px] sm:max-w-none">
            {chapter.title}
          </li>
        </ol>
      </nav>

      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {getChapterLabel(chapter)}
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        {chapter.title}
      </h1>
      <div className="mt-3 mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        <span>約{chapter.readingTime}分</span>
      </div>
      <ChapterTocMobile items={chapter.toc} />
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <div className="prose prose-gray max-w-none">
            <MDXContent
              code={chapter.body}
              components={{
                // 章から出るクイズリンクに流入元を付与し、解答後に章へ戻れるようにする
                QuizLink: (props: ComponentProps<typeof QuizLink>) => (
                  <QuizLink {...props} fromChapter={buildChapterOriginParam(bookSlug, chapterSlug)} />
                ),
              }}
            />
          </div>
          <ChapterNav prev={prev} next={next} bookSlug={bookSlug} />
        </div>
        {chapter.toc.length >= 3 && (
          <aside className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-[7.5rem] max-h-[calc(100vh-8rem)] overflow-y-auto pb-8">
              <ChapterTocDesktop items={chapter.toc} />
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
