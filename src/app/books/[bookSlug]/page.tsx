import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, BookOpen, ChevronRight, Clock } from 'lucide-react';
import { getAllBooks, getBook, getChaptersByBook } from '@/lib/books';
import { getBookTheme } from '@/lib/book-theme';
import { cn } from '@/lib/utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://web-mondai.com';

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
  const chapters = getChaptersByBook(bookSlug);
  const title = `${book.title}（全${chapters.length}章）| ウェブエンジニア問題集`;
  return {
    title,
    description: `${book.description} 全${chapters.length}章で基礎から順番に学べる無料の技術書コンテンツ。`,
    alternates: { canonical: `/books/${bookSlug}` },
    openGraph: {
      title,
      description: book.description,
      type: 'website',
      locale: 'ja_JP',
      url: `${SITE_URL}/books/${bookSlug}`,
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { bookSlug } = await params;
  const book = getBook(bookSlug);
  if (!book) notFound();

  const chapters = getChaptersByBook(bookSlug);
  const theme = getBookTheme(bookSlug);
  const estimatedMinutes = chapters.length * 5;

  return (
    <div>
      {/* パンくず */}
      <nav aria-label="パンくずリスト" className="mb-5 text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
          </li>
          <li><ChevronRight className="size-3.5" /></li>
          <li>
            <Link href="/books" className="hover:text-foreground transition-colors">
              教科書
            </Link>
          </li>
          <li><ChevronRight className="size-3.5" /></li>
          <li className="text-foreground font-medium truncate max-w-[200px]">{book.title}</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{book.title}</h1>
        <p className="mt-3 text-gray-600 leading-relaxed">{book.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5" />
            全{chapters.length}章
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            約{estimatedMinutes}分
          </span>
        </div>
      </div>

      {/* 目次 */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className={cn('px-3 py-2 border-b border-gray-200 sm:px-5 sm:py-3', theme.cardBg)}>
          <h2 className="text-xs font-bold text-gray-800 sm:text-sm">
            目次（全{chapters.length}章）
          </h2>
        </div>
        <ol className="divide-y divide-gray-100">
          {chapters.map((chapter, i) => (
            <li key={chapter.chapterSlug}>
              <Link
                href={`/books/${bookSlug}/${chapter.chapterSlug}`}
                className="group flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 transition-colors sm:gap-4 sm:px-5 sm:py-4"
              >
                <span
                  className={cn(
                    'flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white sm:h-7 sm:w-7 sm:text-xs',
                    i % 2 === 0 ? 'bg-primary' : 'bg-primary/80',
                  )}
                >
                  {chapter.order}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors sm:text-base">
                    {chapter.title}
                  </div>
                  {chapter.description && (
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1 sm:text-sm">
                      {chapter.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="size-3.5 shrink-0 text-gray-300 group-hover:text-primary transition-colors sm:size-4" />
              </Link>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      {chapters.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/books/${bookSlug}/${chapters[0].chapterSlug}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors"
          >
            読みはじめる
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
