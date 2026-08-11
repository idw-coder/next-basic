import { NextRequest, NextResponse } from 'next/server';

import {
  QuizCategoryNotFoundError,
  QuizCategoryQuizzesParamsError,
  getQuizCategoryQuizzes,
} from '@/lib/server/quizCategoryQuizzes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;
  const { searchParams } = new URL(request.url);

  try {
    const { quizzes } = await getQuizCategoryQuizzes(categoryId, {
      q: searchParams.get('q') ?? undefined,
      tagSlug: searchParams.get('tagSlug') ?? undefined,
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    if (error instanceof QuizCategoryQuizzesParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizCategoryNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to fetch category quizzes.', error);
    return NextResponse.json([], { status: 200 });
  }
}
