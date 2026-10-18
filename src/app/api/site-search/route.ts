import { NextRequest, NextResponse } from 'next/server';

import { getAllBooks } from '@/lib/books';
import { searchBooks } from '@/lib/searchBooks';
import { getQuizCategories } from '@/lib/server/quizCategories';
import { searchQuizzes } from '@/lib/server/quizSearch';
import { getQuizTags } from '@/lib/server/quizTags';

export const runtime = 'nodejs';

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
    const [categoriesResult, tagsResult] = await Promise.all([
      getQuizCategories(),
      getQuizTags(),
    ]);

    return NextResponse.json({
      categories: categoriesResult.categories,
      suggestedKeywords: buildSuggestedKeywords(tagsResult.tags),
      books: getAllBooks().map((book) => ({
        bookSlug: book.bookSlug,
        title: book.title,
        description: book.description,
      })),
    });
  }

  const [quizSearchResult, bookResults] = await Promise.all([
    searchQuizzes({ q }),
    Promise.resolve(searchBooks(q)),
  ]);
  const quizResults = quizSearchResult.quizzes as ApiQuiz[];

  return NextResponse.json({
    bookResults: bookResults.slice(0, 8),
    quizResults: quizResults.slice(0, 8).map((quiz) => ({
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
