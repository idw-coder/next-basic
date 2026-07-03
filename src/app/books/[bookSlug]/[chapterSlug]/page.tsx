import type { Metadata } from 'next';
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
import { ChapterNav } from '../../_components/ChapterNav';
import { ChapterTocDesktop, ChapterTocMobile } from '../../_components/TableOfContents';

import { SITE_URL } from '@/lib/site';

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
  const title = `${chapter.title} - ${book.title} | ウェブエンジニア問題集`;
  const description = chapter.description ?? book.description;
  return {
    title,
    description,
    alternates: { canonical: `/books/${bookSlug}/${chapterSlug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/books/${bookSlug}/${chapterSlug}`,
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { bookSlug, chapterSlug } = await params;
  const book = getBook(bookSlug);
  const chapter = getChapter(bookSlug, chapterSlug);
  if (!chapter || !book) notFound();

  const { prev, next } = getAdjacentChapters(bookSlug, chapterSlug);

  return (
    <article>
      {/* パンくず */}
      <nav aria-label="パンくずリスト" className="mb-6 text-xs sm:text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground flex-wrap">
          <li>
            <Link href="/books" className="hover:text-foreground transition-colors">
              教科書
            </Link>
          </li>
          <li><ChevronRight className="size-3" /></li>
          <li>
            <Link
              href={`/books/${bookSlug}`}
              className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[200px] inline-block align-bottom"
            >
              {book.title}
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
          第{chapter.order}章
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
            <MDXContent code={chapter.body} />
          </div>
          <ChapterNav prev={prev} next={next} bookSlug={bookSlug} />
        </div>
        {chapter.toc.length >= 3 && (
          <aside className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8">
              <ChapterTocDesktop items={chapter.toc} />
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}
