import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  Lightbulb,
  Target,
  Users,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/SectionHeading';
import QuizListClient from './QuizListClient';
import CategoryRandomStartCard from './CategoryRandomStartCard';
import { getCategorySeoContent, type CategorySeoContent } from './categoryContent';
import { resolveQuizOrigin } from '@/lib/quizOrigin';
import { getBookForCategory, getChaptersByBook } from '@/lib/books';
import { getBookTheme } from '@/lib/book-theme';
import { getCategoryTheme } from '@/lib/categoryTheme';
import { getQuizCategoryQuizzes } from '@/lib/server/quizCategoryQuizzes';
import { getQuizTagsByCategory } from '@/lib/server/quizCategoryTags';
import { getQuizCategories } from '@/lib/server/quizCategories';
import { getSectionTags } from './sectionTagMap';

import { SITE_URL } from '@/lib/site';

export interface Tag {
  id: number;
  slug: string;
  name: string;
}

export interface Quiz {
  id: number;
  slug: string;
  question: string;
  createdAt?: string;
  updatedAt?: string;
  tags: Tag[];
}

interface Category {
  id: number;
  slug: string;
  category_name: string;
  description?: string | null;
}

async function getCategory(categorySlug: string): Promise<Category | null> {
  try {
    const { categories } = await getQuizCategories();
    return categories.find((c) => c.slug === categorySlug) || null;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

async function getQuizzes(categoryId: number, q?: string, tagSlug?: string): Promise<Quiz[]> {
  try {
    const { quizzes } = await getQuizCategoryQuizzes(categoryId, { q, tagSlug });
    return quizzes;
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    return [];
  }
}

async function getTagsByCategory(categoryId: number): Promise<Tag[]> {
  try {
    const { tags } = await getQuizTagsByCategory(categoryId);
    return tags;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) {
    return { title: 'カテゴリが見つかりません' };
  }

  const title = `${category.category_name} 問題集 | ウェブエンジニア問題集`;
  const description = category.description
    ? `${category.category_name}の問題集。${category.description} 無料で学べる4択クイズ形式。`
    : `${category.category_name}に関する4択クイズ問題集。基礎から実践まで無料で学べます。`;

  return {
    title,
    description,
    alternates: {
      canonical: `/quiz/${categorySlug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ja_JP',
      url: `${SITE_URL}/quiz/${categorySlug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      category.category_name,
      `${category.category_name} クイズ`,
      `${category.category_name} 問題`,
      'ウェブ開発',
      '学習',
      '無料',
    ],
  };
}

function buildJsonLd(
  category: Category,
  quizzes: Quiz[],
  categorySlug: string,
  seoContent: CategorySeoContent | null,
) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${category.category_name} 問題集`,
        item: `${SITE_URL}/quiz/${categorySlug}`,
      },
    ],
  };

  const quizPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.category_name} 問題集`,
    description: category.description || `${category.category_name}に関するクイズ問題集`,
    url: `${SITE_URL}/quiz/${categorySlug}`,
    numberOfItems: quizzes.length,
    isPartOf: {
      '@type': 'WebSite',
      name: 'ウェブエンジニア問題集',
      url: SITE_URL,
    },
  };

  const jsonLdList: Record<string, unknown>[] = [breadcrumb, quizPage];

  if (seoContent && seoContent.faqs.length > 0) {
    jsonLdList.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seoContent.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return jsonLdList;
}

export default async function CategoryQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string; tagSlug?: string; from?: string }>;
}) {
  const { category: categorySlug } = await params;
  const { q, tagSlug, from } = await searchParams;
  const origin = resolveQuizOrigin(from);

  const category = await getCategory(categorySlug);

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>カテゴリが見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href="/" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4 shrink-0" />
                トップページに戻る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [quizzes, tags] = await Promise.all([
    getQuizzes(category.id, q, tagSlug),
    getTagsByCategory(category.id),
  ]);

  const seoContent = getCategorySeoContent(categorySlug);
  const jsonLdList = buildJsonLd(category, quizzes, categorySlug, seoContent);
  const sectionTags = getSectionTags(categorySlug);
  const theme = getCategoryTheme(categorySlug);
  const relatedBook = getBookForCategory(categorySlug);
  const relatedBookChapterCount = relatedBook
    ? getChaptersByBook(relatedBook.bookSlug).length
    : 0;
  const relatedBookTheme = relatedBook ? getBookTheme(relatedBook.bookSlug) : null;
  const heroTitleMain = category.category_name.replace(/基礎・実践$/, '');
  const heroTitleSub = category.category_name.endsWith('基礎・実践')
    ? '基礎・実践 問題集'
    : '問題集';
  const contentShell = 'mx-auto max-w-6xl px-4 sm:px-6';

  return (
    <div className="overflow-x-hidden py-8 text-ink md:py-12">
      {/* 構造化データ */}
      {jsonLdList.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      {/* 教科書から来た場合は読んでいた章に戻れるようにする */}
      {origin && (
        <div className={`${contentShell} mb-3`}>
          <Link
            href={origin.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            {origin.title}
          </Link>
        </div>
      )}

      {/* パンくずリスト */}
      <nav aria-label="パンくずリスト" className={`${contentShell} mb-4 text-sm sm:mb-6`}>
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="text-foreground font-medium">{category.category_name} 問題集</li>
        </ol>
      </nav>

      {/* ファーストビュー */}
      <section className="relative left-1/2 mb-6 min-h-[520px] w-screen -translate-x-1/2 overflow-hidden border-y border-white/85 bg-cream-deep shadow-[0_28px_80px_rgba(47,48,47,0.12)] sm:mb-8 sm:min-h-[560px]">
        <Image
          src="/images/top-hero-editorial.png"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="absolute inset-0 h-full w-full object-cover object-[77%_center] sm:object-[68%_32%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.99)_0%,rgba(255,250,244,0.94)_48%,rgba(255,250,244,0.56)_74%,rgba(255,250,244,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream to-transparent" />
        <div
          className="pointer-events-none absolute -left-9 top-[22%] hidden rotate-[-8deg] text-[7rem] font-black leading-none text-brand-blue/10 md:block"
          aria-hidden="true"
        >
          QUIZ
        </div>
        <div
          className="pointer-events-none absolute bottom-16 right-4 hidden rotate-90 text-4xl font-black tracking-[0.28em] text-white/70 [text-shadow:0_1px_20px_rgba(47,48,47,0.25)] lg:block"
          aria-hidden="true"
        >
          CATEGORY
        </div>
        <div className={`${contentShell} relative z-10 flex min-h-[520px] items-center py-8 sm:min-h-[560px]`}>
          <div className="min-w-0 w-full max-w-[36rem]">
            <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-brand-red/25 bg-white/82 px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-brand-red-deep shadow-[0_10px_30px_rgba(47,48,47,0.08)] sm:text-xs">
              <span className="size-2 rounded-full bg-brand-lime" />
              {theme.label} / {quizzes.length} QUESTIONS
            </p>
            <h1 className="w-full max-w-full font-black leading-[0.92] tracking-normal text-ink">
              <span className="block text-[2.42rem] sm:text-[4.8rem] lg:text-[5.7rem]">
                {heroTitleMain}
              </span>
              <span className={`block text-[1.68rem] sm:text-[3.6rem] lg:text-[4.1rem] ${theme.accentClass}`}>
                {heroTitleSub}
              </span>
            </h1>
            <p className="mt-3 w-fit -rotate-1 bg-brand-red px-3 py-1.5 text-base font-black leading-tight text-white shadow-[8px_8px_0_var(--color-brand-lime)] sm:mt-4 sm:px-4 sm:text-xl">
              解いて、戻って、身につける。
            </p>
            {category.description && (
              <p className="mt-4 max-w-[320px] text-sm font-black leading-7 text-ink-body [overflow-wrap:anywhere] sm:max-w-xl sm:text-base sm:leading-8">
                <span className="[background:linear-gradient(to_top,rgba(255,255,255,0.78)_40%,transparent_40%)] [box-decoration-break:clone]">
                  {category.description}
                </span>
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                size="default"
                className="h-11 rounded-full bg-brand-blue px-5 text-sm font-black shadow-[0_12px_28px_rgba(9,103,201,0.24)] hover:bg-brand-blue-deep sm:h-11 sm:px-7 sm:text-base"
                asChild
              >
                <Link href="#quiz-list" className="inline-flex items-center gap-1.5 sm:gap-2">
                  問題を解く
                  <ArrowRight className="size-3.5 sm:size-4" />
                </Link>
              </Button>
              {relatedBook && (
                <Button
                  variant="outline"
                  size="default"
                  className="h-11 rounded-full border-ink/20 bg-white/86 px-5 text-sm font-black text-ink shadow-[0_12px_28px_rgba(47,48,47,0.08)] hover:bg-white sm:h-11 sm:px-7 sm:text-base"
                  asChild
                >
                  <Link href={`/books/${relatedBook.bookSlug}`}>教科書で復習</Link>
                </Button>
              )}
            </div>
            <div className="mt-5 grid w-full max-w-[340px] min-w-0 grid-cols-3 overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/90 px-2 py-2.5 shadow-[0_18px_50px_rgba(47,48,47,0.12)] backdrop-blur sm:max-w-md sm:px-3">
              <div className="min-w-0 text-center">
                <p className="text-2xl font-black leading-none text-brand-red sm:text-3xl">
                  {quizzes.length}
                </p>
                <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                  問題
                </p>
              </div>
              <div className="min-w-0 border-x border-ink/10 text-center">
                <p className="text-2xl font-black leading-none text-ink sm:text-3xl">
                  {tags.length}
                </p>
                <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                  タグ
                </p>
              </div>
              <div className="min-w-0 text-center">
                <p className="text-2xl font-black leading-none text-brand-blue sm:text-3xl">
                  0円
                </p>
                <p className="mt-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-body">
                  無料
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 学習導線 */}
      <section
        className={`${contentShell} mb-4 grid min-w-0 gap-2 ${relatedBook ? 'sm:grid-cols-2' : 'max-w-[220px] sm:max-w-[260px]'}`}
      >
        {relatedBook && relatedBookTheme && (
          <Link href={`/books/${relatedBook.bookSlug}`} className="group block h-full min-w-0">
            <div
              className={`relative flex h-full overflow-hidden rounded-lg border border-black/10 ${relatedBookTheme.cardBg} px-2.5 py-2 transition-colors hover:bg-white sm:px-3 sm:py-2.5`}
            >
              <BookOpen
                className={`pointer-events-none absolute right-1/4 top-1/2 size-14 -translate-y-1/2 -rotate-12 ${relatedBookTheme.iconText} opacity-[0.05] sm:size-16`}
                aria-hidden="true"
              />
              <div className="relative z-10 min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span
                    className={`rounded-full bg-white/80 px-1.5 py-px text-[9px] font-bold leading-none ${relatedBookTheme.badgeText} sm:text-[10px]`}
                  >
                    教科書
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                    全{relatedBookChapterCount}章
                  </span>
                </div>
                <p className="line-clamp-1 text-[11px] font-bold leading-snug text-foreground sm:text-[13px]">
                  {relatedBook.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                  解説で理解を深める
                </p>
              </div>
            </div>
          </Link>
        )}

        <CategoryRandomStartCard
          categoryId={category.id}
          categorySlug={category.slug}
          categoryName={category.category_name}
          tags={tags}
        />
      </section>

      {/* 問題一覧 */}
      <section id="quiz-list" className={`${contentShell} mb-10 scroll-mt-28`}>
        <h2 className="sr-only">{category.category_name}の問題一覧</h2>
        <QuizListClient
          initialQuizzes={quizzes}
          tags={tags}
          categoryId={category.id}
          categorySlug={categorySlug}
          currentQuery={q}
          currentTagSlug={tagSlug}
          sectionTags={sectionTags}
          originParam={origin ? from : undefined}
        />
      </section>

      {/* カテゴリ概要（SEOコンテンツ） */}
      {seoContent && (
        <section className={`${contentShell} mb-10`}>
          <Card className="border-primary/10 bg-gradient-to-br from-primary/[0.03] to-transparent">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    {category.category_name}とは
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {seoContent.overview}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="size-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    なぜ{category.category_name}を学ぶべきか
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {seoContent.whyLearn}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 出題トピック */}
      {seoContent && (
        <section className={`${contentShell} mb-10`}>
          <SectionHeading
            size="sm"
            center={false}
            className="mb-4"
            icon={<BookOpenCheck className="size-5 text-primary" />}
          >
            出題トピック
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2">
            {seoContent.topics.map((topic) => {
              return (
                <div
                  key={topic.title}
                  className="rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-4"
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

      {/* 対象者 */}
      {seoContent && (
        <section className={`${contentShell} mb-10`}>
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
                  className="flex items-center gap-3 rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3 text-sm text-foreground"
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

      {/* よくある質問（FAQ） */}
      {seoContent && seoContent.faqs.length > 0 && (
        <section className={`${contentShell} mb-10`}>
          <SectionHeading
            size="sm"
            center={false}
            className="mb-4"
            icon={<HelpCircle className="size-5 text-primary" />}
          >
            {category.category_name}に関するよくある質問
          </SectionHeading>
          <div className="space-y-3">
            {seoContent.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-2 p-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 関連カテゴリ */}
      {seoContent && seoContent.relatedCategories.length > 0 && (
        <section className={`${contentShell} mb-4`}>
          <SectionHeading size="sm" center={false} className="mb-4">
            関連する問題集
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-3">
            {seoContent.relatedCategories.map((related) => {
              return (
                <Link key={related.slug} href={`/quiz/${related.slug}`} className="group">
                  <div
                    className="flex items-center rounded-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm pr-3 group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span className="flex-1 font-bold text-sm text-foreground py-3 pl-4 truncate">
                      {related.name}
                    </span>
                    <div
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary group-hover:scale-110 transition-transform duration-200"
                    >
                      <ChevronRight className="size-4 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
