import { NextResponse } from 'next/server';

import {
  QuizDetailNotFoundError,
  QuizDetailParamsError,
  getQuizDetail,
} from '@/lib/server/quizDetail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { quizId } = await params;

  try {
    const { quiz, source } = await getQuizDetail(quizId);

    if (!quiz) {
      return NextResponse.json(null, {
        headers: { 'x-next-api-fallback': source },
      });
    }

    return NextResponse.json(quiz, {
      headers: source !== 'db' ? { 'x-next-api-fallback': source } : undefined,
    });
  } catch (error) {
    if (error instanceof QuizDetailParamsError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizDetailNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to fetch quiz detail.', error);
    return NextResponse.json(null, { status: 200 });
  }
}
