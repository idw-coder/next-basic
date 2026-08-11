import { NextRequest, NextResponse } from 'next/server';

import { QuizSearchParamsError, searchQuizzes } from '@/lib/server/quizSearch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const { quizzes } = await searchQuizzes({
      q: searchParams.get('q') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      tagSlug: searchParams.get('tagSlug') ?? undefined,
      ids: searchParams.get('ids') ?? undefined,
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    if (error instanceof QuizSearchParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to search quizzes.', error);
    return NextResponse.json([], { status: 200 });
  }
}
