import { NextRequest, NextResponse } from 'next/server';

import {
  QuizCategoryTagsParamsError,
  getQuizTagsByCategory,
} from '@/lib/server/quizCategoryTags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const { categoryId } = await params;

  try {
    const { tags, source } = await getQuizTagsByCategory(categoryId);
    return NextResponse.json(tags, {
      headers: source !== 'db' ? { 'x-next-api-fallback': source } : undefined,
    });
  } catch (error) {
    if (error instanceof QuizCategoryTagsParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to fetch category tags.', error);
    return NextResponse.json([], { status: 200 });
  }
}
