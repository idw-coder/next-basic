import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllBooks, getBook, getChaptersByBook } from '@/lib/books';

export function generateStaticParams() {
  return getAllBooks().map((book) => ({ bookSlug: book.bookSlug }));
}

interface BookPageProps {
  params: Promise<{ bookSlug: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { bookSlug } = await params;
  const book = getBook(bookSlug);
  if (!book) return {};
  return {
    title: `${book.title} | ウェブエンジニア問題集`,
    description: book.description,
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { bookSlug } = await params;
  const book = getBook(bookSlug);
  if (!book) notFound();

  const chapters = getChaptersByBook(bookSlug);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">{book.description}</p>
      </div>

      <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">目次（全{chapters.length}章）</h2>
        </div>
        <ol className="divide-y divide-gray-100">
          {chapters.map((chapter) => (
            <li key={chapter.chapterSlug}>
              <Link
                href={`/books/${bookSlug}/${chapter.chapterSlug}`}
                className="group flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {chapter.order}
                </span>
                <div className="min-w-0 pt-0.5">
                  <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {chapter.title}
                  </div>
                  {chapter.description && (
                    <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
                      {chapter.description}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {chapters.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Link
            href={`/books/${bookSlug}/${chapters[0].chapterSlug}`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            読みはじめる
          </Link>
        </div>
      )}
    </div>
  );
}
