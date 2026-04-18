import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getBook,
  getChapter,
  getAdjacentChapters,
  getChaptersByBook,
  getAllBooks,
} from '@/lib/books';
import { MDXContent } from '@/components/mdx-content';
import { ChapterNav } from '../../_components/ChapterNav';

/**
 * SSG
 * ビルド時にすべてのパスを事前に把握して静的生成
 */
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
  return {
    title: `${chapter.title} - ${book.title} | ウェブエンジニア問題集`,
    description: chapter.description ?? book.description,
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { bookSlug, chapterSlug } = await params;
  const chapter = getChapter(bookSlug, chapterSlug);
  if (!chapter) notFound();

  const { prev, next } = getAdjacentChapters(bookSlug, chapterSlug);

  return (
    <article>
      <div className="prose prose-gray max-w-none">
        <MDXContent code={chapter.body} />
      </div>
      <ChapterNav prev={prev} next={next} />
    </article>
  );
}
