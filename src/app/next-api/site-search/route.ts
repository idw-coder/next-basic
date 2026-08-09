import { NextRequest, NextResponse } from 'next/server';

import { getAllBooks } from '@/lib/books';
import { searchBooks } from '@/lib/searchBooks';
import { getQuizCategories } from '@/lib/server/quizCategories';

export const runtime = 'nodejs';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8888';

const EXCLUDED_SUGGESTED_TAG_SLUGS = new Set([
  'basic',
  'convenience',
  'error',
  'test-tag',
]);

interface Tag {
  id: number;
  slug: string;
  name: string;
  quiz_count?: number;
}

interface ApiQuiz {
  id: number;
  slug: string;
  question: string;
  tags: Tag[];
  category_id: number;
  category_slug: string | null;
  category_name: string | null;
}

async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function buildSuggestedKeywords(tags: Tag[]): string[] {
  return tags
    .filter((tag) => !EXCLUDED_SUGGESTED_TAG_SLUGS.has(tag.slug))
    .sort((a, b) => (b.quiz_count ?? 0) - (a.quiz_count ?? 0))
    .map((tag) => tag.name)
    .slice(0, 18);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q) {
    const [categoriesResult, tags] = await Promise.all([
      getQuizCategories(),
      fetchApiJson<Tag[]>('/api/quiz/tags', { next: { revalidate: 3600 } }),
    ]);

    return NextResponse.json({
      categories: categoriesResult.categories,
      suggestedKeywords: buildSuggestedKeywords(tags ?? []),
      books: getAllBooks().map((book) => ({
        bookSlug: book.bookSlug,
        title: book.title,
        description: book.description,
      })),
    });
  }

  const params = new URLSearchParams({ q });
  const [quizResults, bookResults] = await Promise.all([
    fetchApiJson<ApiQuiz[]>(`/api/quiz/search?${params.toString()}`, {
      cache: 'no-store',
    }),
    Promise.resolve(searchBooks(q)),
  ]);

  return NextResponse.json({
    bookResults: bookResults.slice(0, 8),
    quizResults: (quizResults ?? []).slice(0, 8).map((quiz) => ({
      id: quiz.id,
      slug: quiz.slug,
      question: quiz.question,
      categoryId: quiz.category_id,
      categorySlug: quiz.category_slug ?? '',
      categoryName: quiz.category_name ?? '',
      tags: quiz.tags ?? [],
    })),
  });
}
