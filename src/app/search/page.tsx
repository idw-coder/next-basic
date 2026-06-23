import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, Search } from 'lucide-react';
import SearchClient from './SearchClient';
import { getAllBooks } from '@/lib/books';
import { searchBooks } from '@/lib/searchBooks';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://web-mondai.com';

interface Category {
  id: number;
  slug: string;
  category_name: string;
}

interface Tag {
  id: number;
  slug: string;
  name: string;
}

const EXCLUDED_SUGGESTED_TAG_SLUGS = new Set([
  'basic',
  'convenience',
  'error',
  'test-tag',
]);

function buildSuggestedKeywords(tags: Tag[]): string[] {
  return tags
    .filter((tag) => !EXCLUDED_SUGGESTED_TAG_SLUGS.has(tag.slug))
    .map((tag) => tag.name);
}

export interface SearchQuiz {
  id: number;
  slug: string;
  question: string;
  tags: Tag[];
  categoryId: number;
  categorySlug: string;
  categoryName: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/categories`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/quiz/tags`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function searchQuizzes(q: string): Promise<SearchQuiz[]> {
  if (!q.trim()) return [];

  try {
    const params = new URLSearchParams({ q });
    const res = await fetch(
      `${API_BASE_URL}/api/quiz/search?${params.toString()}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    const quizzes: {
      id: number;
      slug: string;
      question: string;
      tags: Tag[];
      category_id: number;
      category_slug: string | null;
      category_name: string | null;
    }[] = await res.json();
    return quizzes.map((quiz) => ({
      id: quiz.id,
      slug: quiz.slug,
      question: quiz.question,
      tags: quiz.tags,
      categoryId: quiz.category_id,
      categorySlug: quiz.category_slug ?? '',
      categoryName: quiz.category_name ?? '',
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;

  const title = q
    ? `「${q}」の検索結果 | ウェブエンジニア問題集`
    : '検索 | ウェブエンジニア問題集';
  const description = q
    ? `「${q}」に関連するクイズ・教科書の検索結果。4択クイズと技術書コンテンツを無料で学習できます。`
    : 'キーワードでクイズと教科書を横断検索。HTML、CSS、JavaScript、React など全カテゴリと教科書章から一括で探せます。';

  return {
    title,
    description,
    alternates: {
      canonical: '/search',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ja_JP',
      url: `${SITE_URL}/search`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function buildJsonLd(q?: string, resultCount?: number) {
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
        name: '検索',
        item: `${SITE_URL}/search`,
      },
    ],
  };

  const searchAction = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: q ? `「${q}」の検索結果` : '検索',
    description: 'ウェブエンジニア問題集の横断検索（クイズ・教科書）',
    url: `${SITE_URL}/search${q ? `?q=${encodeURIComponent(q)}` : ''}`,
    ...(resultCount !== undefined && { numberOfItems: resultCount }),
    isPartOf: {
      '@type': 'WebSite',
      name: 'ウェブエンジニア問題集',
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  };

  return [breadcrumb, searchAction];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const trimmed = q?.trim() ?? '';
  const [categories, tags, quizResults, bookResults] = await Promise.all([
    getCategories(),
    getTags(),
    trimmed ? searchQuizzes(trimmed) : Promise.resolve([]),
    trimmed ? Promise.resolve(searchBooks(trimmed)) : Promise.resolve([]),
  ]);
  const books = getAllBooks().map((b) => ({ bookSlug: b.bookSlug, title: b.title }));
  const suggestedKeywords = buildSuggestedKeywords(tags);
  const totalCount = quizResults.length + bookResults.length;
  const jsonLdList = buildJsonLd(trimmed || undefined, trimmed ? totalCount : undefined);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {jsonLdList.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      <nav aria-label="パンくずリスト" className="mb-6 text-sm">
        <ol className="flex items-center gap-1 text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="text-foreground font-medium">検索</li>
        </ol>
      </nav>

      <section className="mb-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/10">
            <Search className="size-7 text-violet-500" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            クイズ・教科書を検索
          </h1>
          <div className="flex justify-center gap-1 mt-2.5 mb-3">
            <span className="w-5 h-1.5 rounded-full bg-red-400" />
            <span className="w-5 h-1.5 rounded-full bg-blue-400" />
            <span className="w-5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-5 h-1.5 rounded-full bg-green-400" />
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            全{categories.length}カテゴリのクイズと、{books.length}冊の教科書から横断検索できます
          </p>
        </div>
      </section>

      <SearchClient
        initialQuizResults={quizResults}
        initialBookResults={bookResults}
        categories={categories}
        books={books}
        currentQuery={trimmed}
        suggestedKeywords={suggestedKeywords}
      />
    </div>
  );
}
