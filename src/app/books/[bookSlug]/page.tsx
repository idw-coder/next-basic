import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  Clock,
  HelpCircle,
  Lightbulb,
  Target,
  Users,
} from 'lucide-react';
import { getAllBooks, getBook, getChaptersByBook } from '@/lib/books';
import { getBookTheme } from '@/lib/book-theme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/SectionHeading';
import { getBookSeoContent, type BookSeoContent } from '../_constants/bookSeoContent';

import { SITE_URL } from '@/lib/site';

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
  const seoContent = getBookSeoContent(bookSlug);
  const title = `${book.title}（全${chapters.length}章）| ウェブエンジニア問題集`;
  const description = seoContent
    ? `${book.description} ${seoContent.prerequisites ? `前提知識：${seoContent.prerequisites}` : ''} 全${chapters.length}章で基礎から順番に学べる無料の技術書コンテンツ。`
    : `${book.description} 全${chapters.length}章で基礎から順番に学べる無料の技術書コンテンツ。`;
  return {
    title,
    description,
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

function buildJsonLd(
  book: { title: string; description: string; bookSlug: string; coverImage?: string },
  chapters: { title: string }[],
  estimatedMinutes: number,
  seoContent: BookSeoContent | null,
) {
  const bookUrl = `${SITE_URL}/books/${book.bookSlug}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '教科書', item: `${SITE_URL}/books` },
      { '@type': 'ListItem', position: 3, name: book.title, item: bookUrl },
    ],
  };

  const bookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    description: book.description,
    url: bookUrl,
    inLanguage: 'ja',
    isAccessibleForFree: true,
    numberOfPages: chapters.length,
    timeRequired: `PT${estimatedMinutes}M`,
    publisher: {
      '@type': 'Organization',
      name: 'ウェブエンジニア問題集',
      url: SITE_URL,
    },
  };

  const jsonLdList: Record<string, unknown>[] = [breadcrumb, bookSchema];

  if (seoContent && seoContent.faqs.length > 0) {
    jsonLdList.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seoContent.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return jsonLdList;
}

export default async function BookPage({ params }: BookPageProps) {
  const { bookSlug } = await params;
  const book = getBook(bookSlug);
  if (!book) notFound();

  const chapters = getChaptersByBook(bookSlug);
  const theme = getBookTheme(bookSlug);
  const estimatedMinutes = chapters.reduce((total, chapter) => total + chapter.readingTime, 0);
  const seoContent = getBookSeoContent(bookSlug);
  const jsonLdList = buildJsonLd(book, chapters, estimatedMinutes, seoContent);

  return (
    <div>
      {/* 構造化データ */}
      {jsonLdList.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      {/* パンくず */}
      <nav aria-label="パンくずリスト" className="mb-5 text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href="/books" className="hover:text-foreground transition-colors">
              教科書
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="text-foreground font-medium truncate max-w-[200px]">{book.title}</li>
        </ol>
      </nav>

      {/* ヒーローカード */}
      <section
        className={cn(
          'relative mb-6 overflow-hidden rounded-2xl border shadow-[0_18px_50px_rgba(47,48,47,0.10)]',
          theme.cardBg,
        )}
      >
        <Image
          src="/images/top-hero-editorial.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 700px"
          className="absolute inset-0 h-full w-full object-cover object-[78%_center] opacity-[0.07]"
        />
        <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
          <p
            className={cn(
              'mb-3 inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] shadow-sm sm:text-xs',
              theme.badgeText,
            )}
          >
            <span className={cn('size-2 rounded-full', theme.accentBg)} />
            BOOK / 全{chapters.length}章
          </p>
          <h1 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{book.title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-body sm:text-base sm:leading-7">
            {book.description}
          </p>

          {/* スタッツ */}
          <div className="mt-5 grid max-w-sm grid-cols-3 rounded-[1.25rem] border border-white/80 bg-white/90 px-3 py-2.5 shadow-sm">
            <div className="text-center">
              <p className={cn('text-2xl font-black leading-none sm:text-3xl', theme.accent)}>
                {chapters.length}
              </p>
              <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">章</p>
            </div>
            <div className="border-x border-ink/10 text-center">
              <p className="text-2xl font-black leading-none text-ink sm:text-3xl">
                {estimatedMinutes}
                <span className="text-sm font-bold text-ink-muted">分</span>
              </p>
              <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                読了目安
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black leading-none text-brand-blue sm:text-3xl">0円</p>
              <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                すべて無料
              </p>
            </div>
          </div>

          {/* CTA */}
          {chapters.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                size="default"
                className={cn(
                  'h-11 rounded-full px-5 text-sm font-black shadow-md hover:opacity-90 sm:px-7 sm:text-base',
                  theme.accentBg,
                  'text-white',
                )}
                asChild
              >
                <Link
                  href={`/books/${bookSlug}/${chapters[0].chapterSlug}`}
                  className="inline-flex items-center gap-1.5 sm:gap-2"
                >
                  読みはじめる
                  <ArrowRight className="size-3.5 sm:size-4" />
                </Link>
              </Button>
              {seoContent?.relatedQuizSlug && (
                <Button
                  variant="outline"
                  size="default"
                  className="h-11 rounded-full border-ink/20 bg-white/86 px-5 text-sm font-black text-ink shadow-sm hover:bg-white sm:px-7 sm:text-base"
                  asChild
                >
                  <Link href={`/quiz/${seoContent.relatedQuizSlug}`}>クイズで腕試し</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 目次 */}
      <section className="mb-8">
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
                  className="group flex items-center gap-2 px-2.5 py-2 hover:bg-gray-50 transition-colors sm:gap-4 sm:px-5 sm:py-3.5"
                >
                  <span
                    className={cn(
                      'w-5 shrink-0 text-center text-[11px] font-bold tabular-nums sm:flex sm:h-7 sm:w-7 sm:items-center sm:justify-center sm:rounded-full sm:text-xs sm:text-white',
                      i % 2 === 0
                        ? 'text-primary sm:bg-primary'
                        : 'text-primary/70 sm:bg-primary/80',
                    )}
                  >
                    {chapter.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] leading-snug font-medium text-gray-900 group-hover:text-primary transition-colors sm:text-base">
                      {chapter.title}
                      {chapter.draft && (
                        <span className="ml-2 inline-block rounded-full bg-gray-200 px-2 py-0.5 align-middle text-[10px] font-medium text-gray-500 sm:text-[11px]">
                          執筆中
                        </span>
                      )}
                    </div>
                    {chapter.description && (
                      <p className="mt-0.5 hidden text-gray-500 line-clamp-1 sm:block sm:text-sm">
                        {chapter.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
                      <Clock className="size-3" />
                      <span>約{chapter.readingTime}分</span>
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 shrink-0 text-gray-300 group-hover:text-primary transition-colors sm:size-4" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SEOコンテンツ：概要 */}
      {seoContent && (
        <section className="mb-8">
          <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.03] to-transparent p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">この本で学べること</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{seoContent.overview}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-foreground mb-1">なぜ学ぶべきか</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {seoContent.whyLearn}
                </p>
              </div>
            </div>
            {seoContent.prerequisites && (
              <div className="flex items-start gap-3">
                <BookOpen className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">前提知識</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {seoContent.prerequisites}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SEOコンテンツ：出題トピック */}
      {seoContent && (
        <section className="mb-8">
          <SectionHeading
            size="sm"
            center={false}
            className="mb-4"
            icon={<BookOpenCheck className="size-5 text-primary" />}
          >
            学習トピック
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {seoContent.topics.map((topic, i) => {
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
                  key={topic.title}
                  className={`rounded-md bg-white border border-gray-100 shadow-sm border-l-[5px] ${borderColors[i % borderColors.length]} p-4`}
                >
                  <h3 className="text-sm font-bold text-foreground mb-1">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SEOコンテンツ：対象者 */}
      {seoContent && (
        <section className="mb-8">
          <SectionHeading
            size="sm"
            center={false}
            className="mb-4"
            icon={<Users className="size-5 text-primary" />}
          >
            こんな方におすすめ
          </SectionHeading>
          <ul className="grid gap-2 sm:grid-cols-2">
            {seoContent.targetAudience.map((audience, i) => {
              const dotColors = [
                'bg-red-400',
                'bg-blue-400',
                'bg-amber-400',
                'bg-green-400',
                'bg-purple-400',
                'bg-cyan-400',
              ];
              return (
                <li
                  key={audience}
                  className="flex items-center gap-3 rounded-md bg-white border border-gray-100 shadow-sm px-4 py-3 text-sm text-foreground"
                >
                  <span
                    className={`size-2 rounded-full ${dotColors[i % dotColors.length]} shrink-0`}
                  />
                  {audience}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* SEOコンテンツ：よくある質問 */}
      {seoContent && seoContent.faqs.length > 0 && (
        <section className="mb-8">
          <SectionHeading
            size="sm"
            center={false}
            className="mb-4"
            icon={<HelpCircle className="size-5 text-primary" />}
          >
            よくある質問
          </SectionHeading>
          <div className="space-y-3">
            {seoContent.faqs.map((faq) => (
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
      )}

      {/* 読みはじめるCTA（ボトム） */}
      {chapters.length > 0 && (
        <div className="mb-4 flex justify-center">
          <Button
            className={cn(
              'rounded-full px-8 py-3 text-sm font-bold shadow-md hover:opacity-90',
              theme.accentBg,
              'text-white',
            )}
            size="default"
            asChild
          >
            <Link
              href={`/books/${bookSlug}/${chapters[0].chapterSlug}`}
              className="inline-flex items-center gap-2"
            >
              読みはじめる
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
